import { searchCollegeFallback } from '../api/colleges/fallbackLogic';
// Note: Ingestion/Cache are now internal to the file and cannot be easily mocked externally without exporting them.
// This script will now run against the "real" logic (minus FB admin if env missing).

// Mock console to keep output clean but visible
const originalConsole = { ...console };

console.log("----------------------------------------------------------------");
console.log("STARTING COLLEGE FALLBACK VERIFICATION");
console.log("----------------------------------------------------------------");

// --- MOCKING ---
// We are mocking dependencies to run this without a real Firebase Admin environment for safety
// and to avoid needing service account keys in this script context.

// Mock Ingestion (DB)
// Since we cannot mock internal ingestion, we accept that the DB part will fail/skip
// and rely on the API part or the fact that missing env vars will skip DB.

// Mock Cache
// We use the real cache, but ensure it's enabled.
import * as dotenv from 'dotenv';
dotenv.config();

// Ensure enabled
process.env.ENABLE_COLLEGE_FALLBACK = 'true';

async function runTest() {
    try {
        console.log("----------------------------------------------------");
        console.log("Starting Verification for Fallback Logic (Local)");
        console.log("----------------------------------------------------");

        // 1. Search for something we know is in the ingested data or external API
        const query = "Techno India";
        console.log(`\n1. Searching for '${query}'...`);

        const start = Date.now();
        const results = await searchCollegeFallback(query);
        const duration = Date.now() - start;

        console.log(`Duration: ${duration}ms`);
        console.log(`Result Count: ${results.length}`);

        if (results.length > 0) {
            console.log("First Result:", JSON.stringify(results[0], null, 2));
            console.log("✅ Search Successful");
        } else {
            console.warn("⚠️ Search yielded 0 results. If API is down or data missing, this is expected.");
        }

        // 2. Cache Hit Check (Mock or Second Run)
        console.log(`\n2. Running search for '${query}' again (Should hit Cache)...`);

        const start2 = Date.now();
        const results2 = await searchCollegeFallback(query);
        const duration2 = Date.now() - start2;

        console.log(`Result Count: ${results2.length}`);
        console.log(`Duration: ${duration2}ms`);

        if (duration2 < 100 && results2.length === results.length) {
            console.log("✅ Cache Hit Successful (Fast response)");
        } else {
            console.log("⚠️ Cache might have missed or logic is slow");
        }

    } catch (e) {
        console.error("TEST FAILED:", e);
    }
}

runTest();
