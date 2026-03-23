import * as fs from 'fs';
import * as path from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as readline from 'readline';

import * as dotenv from 'dotenv';
dotenv.config();

// CONFIG
const CSV_FILE = 'colleges (1).csv';
const COLLECTION_NAME = 'colleges_fallback';
const BATCH_SIZE = 400;

// simple CSV line parser handling quotes
function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let start = 0;
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') {
            inQuotes = !inQuotes;
        } else if (line[i] === ',' && !inQuotes) {
            let field = line.substring(start, i);
            if (field.startsWith('"') && field.endsWith('"')) {
                field = field.substring(1, field.length - 1);
            }
            // handle double double quotes
            field = field.replace(/""/g, '"');
            result.push(field.trim());
            start = i + 1;
        }
    }
    let lastField = line.substring(start);
    if (lastField.startsWith('"') && lastField.endsWith('"')) {
        lastField = lastField.substring(1, lastField.length - 1);
    }
    lastField = lastField.replace(/""/g, '"');
    result.push(lastField.trim());
    return result;
}

async function main() {
    console.log("Starting ingestion...");
    // console.log("Keys loaded:", Object.keys(process.env).filter(k => k.startsWith('FIREBASE_')));

    // Init Firebase, check for keys...  // Support Service Account Key JSON or Individual Env Vars
    const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (getApps().length === 0) {
        let credential;
        // Support Service Account Key JSON or Individual Env Vars
        if (key) {
            const serviceAccount = JSON.parse(key);
            credential = cert(serviceAccount);
        } else if (projectId && clientEmail && privateKey) {
            credential = cert({
                projectId,
                clientEmail,
                privateKey: privateKey.replace(/\\n/g, '\n'),
            });
        } else {
            console.error("Error: Missing Firebase Credentials. Need FIREBASE_SERVICE_ACCOUNT_KEY OR (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)");
            process.exit(1);
        }

        initializeApp({
            credential
        });
    }

    const db = getFirestore();
    const csvPath = path.resolve(process.cwd(), CSV_FILE);

    if (!fs.existsSync(csvPath)) {
        console.error(`File not found: ${csvPath}`);
        process.exit(1);
    }

    const fileStream = fs.createReadStream(csvPath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let headers: string[] = [];
    let batch = db.batch();
    let batchCount = 0;
    let totalIngested = 0;
    let lineCount = 0;

    console.log(`Reading from ${csvPath}...`);

    for await (const line of rl) {
        lineCount++;
        if (lineCount === 1) {
            headers = parseCSVLine(line).map(h => h.toLowerCase().trim());
            console.log("Headers:", headers);
            continue;
        }

        const values = parseCSVLine(line);
        if (values.length < 3) continue; // skip empty or malformed

        const row: any = {};
        headers.forEach((h, i) => {
            if (values[i]) row[h] = values[i];
        });

        // Map to College Interface
        // id,state,name,address_line1,address_line2,city,district,pin_code
        if (!row.name) continue;

        const college = {
            name: row.name,
            state: row.state || 'Unknown',
            city: row.city || row.district || '',
            address: [row.address_line1, row.address_line2].filter(Boolean).join(', '),
            pin_code: row.pin_code,
            source: 'csv_ingestion',
            ingested_at: new Date().toISOString()
        };

        // Create ID
        const docId = `${college.name}-${college.state}`
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        if (docId.length < 2) continue;

        const docRef = db.collection(COLLECTION_NAME).doc(docId);
        batch.set(docRef, college, { merge: true });
        batchCount++;

        if (batchCount >= BATCH_SIZE) {
            await batch.commit();
            totalIngested += batchCount;
            console.log(`Ingested ${totalIngested} colleges...`);
            batch = db.batch();
            batchCount = 0;
            // distinct delay to avoid hitting write limits too hard if purely sequential
            await new Promise(r => setTimeout(r, 200));
        }
    }

    if (batchCount > 0) {
        await batch.commit();
        totalIngested += batchCount;
    }

    console.log(`\nDone! Successfully ingested ${totalIngested} colleges from ${lineCount} lines.`);
}

main().catch(console.error);
