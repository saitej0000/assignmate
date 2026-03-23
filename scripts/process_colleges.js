import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const statesDir = path.join(__dirname, '../states');
const outputFile = path.join(__dirname, '../public/colleges.json');

// Helper to convert string to Title Case
const toTitleCase = (str) => {
    if (!str) return '';
    return str.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};

// Helper to parse CSV line respecting quotes
const parseCSVLine = (text) => {
    const re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
    let arr = [];
    let quote = false;
    let col = '';
    for (let c of text) {
        if (c === '"') {
            quote = !quote;
        } else if (c === ',' && !quote) {
            arr.push(col);
            col = '';
            continue;
        }
        col += c;
    }
    arr.push(col);
    return arr.map(c => c.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
};

const processColleges = () => {
    try {
        let allColleges = [];
        const seen = new Set();
        const uniqueColleges = [];

        // 1. Process State JSONs (Rich Data) - High Priority
        console.log('--- Processing State JSONs ---');
        const files = fs.readdirSync(statesDir);
        files.forEach(file => {
            if (path.extname(file) === '.json') {
                const filePath = path.join(statesDir, file);
                const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

                if (Array.isArray(data)) {
                    data.forEach(item => {
                        const name = toTitleCase(item.institute_name);
                        const university = toTitleCase(item.university);
                        const state = toTitleCase(item.state);

                        // Create a composite key for deduplication
                        const key = `${name.toLowerCase()}|${state.toLowerCase()}`; // We'll deduplicate primarily by Name + State for the merger 

                        if (!seen.has(key)) {
                            seen.add(key);
                            uniqueColleges.push({
                                id: item.aicte_id || `gen-${Math.random().toString(36).substr(2, 9)}`,
                                name: name,
                                university: university,
                                state: state,
                                district: toTitleCase(item.district),
                                type: toTitleCase(item.institution_type)
                            });
                        }
                    });
                }
            }
        });
        console.log(`Loaded ${uniqueColleges.length} rich records from JSON files.`);

        // 2. Process CSV (Broad Data) - Low Priority
        console.log('--- Processing CSV Fallback ---');
        const csvPath = path.join(__dirname, '../colleges (1).csv');
        if (fs.existsSync(csvPath)) {
            const csvContent = fs.readFileSync(csvPath, 'utf8');
            const lines = csvContent.split('\n');
            const headers = parseCSVLine(lines[0]); // id,state,name,...

            // Map header indices
            const idxName = headers.indexOf('name');
            const idxState = headers.indexOf('state');
            const idxDistrict = headers.indexOf('district');
            const idxCity = headers.indexOf('city');

            let csvAdded = 0;
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                const cols = parseCSVLine(lines[i]);
                if (cols.length < 3) continue;

                const name = cols[idxName];
                const state = cols[idxState];
                // CSV names often are uppercase
                const titleName = toTitleCase(name);
                const titleState = toTitleCase(state);

                const key = `${titleName.toLowerCase()}|${titleState.toLowerCase()}`;

                if (!seen.has(key)) {
                    seen.add(key);
                    uniqueColleges.push({
                        id: `csv-${i}`,
                        name: titleName,
                        university: 'Unknown', // CSV lacks this
                        state: titleState,
                        district: toTitleCase(cols[idxDistrict] || cols[idxCity]),
                        type: 'Unknown' // CSV lacks this
                    });
                    csvAdded++;
                }
            }
            console.log(`Added ${csvAdded} new records from CSV.`);
        } else {
            console.log('CSV file not found, skipping.');
        }

        console.log(`Total unique colleges: ${uniqueColleges.length}`);

        fs.writeFileSync(outputFile, JSON.stringify(uniqueColleges, null, 2));
        console.log(`Successfully wrote to ${outputFile}`);

    } catch (err) {
        console.error('Error processing colleges:', err);
    }
};

processColleges();
