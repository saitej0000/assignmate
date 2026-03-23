// --- CONFIG ---
const CONFIG = {
    ENABLED: process.env.ENABLE_COLLEGE_FALLBACK === 'true',
    API_URL: process.env.COLLEGE_API_URL || 'https://indian-colleges-list.vercel.app/api/institutions',
    CACHE_TTL_MS: 1000 * 60 * 60, // 1 hour
    FALLBACK_COLLECTION: 'colleges_fallback'
};

// --- TYPES ---
export interface College {
    name: string;
    state: string;
    city?: string;
    university?: string;
    type?: string;
}

// --- LOGGER ---
const logger = {
    info: (message: string, meta?: any) => {
        console.log(`[CollegeFallback] [INFO] ${message}`, meta ? JSON.stringify(meta) : '');
    },
    warn: (message: string, meta?: any) => {
        console.warn(`[CollegeFallback] [WARN] ${message}`, meta ? JSON.stringify(meta) : '');
    },
    error: (message: string, error?: any) => {
        console.error(`[CollegeFallback] [ERROR] ${message}`, error);
    }
};

// --- CACHE ---
interface CacheEntry {
    data: College[];
    timestamp: number;
}
const memoryCache = new Map<string, CacheEntry>();

const cache = {
    get: (query: string): College[] | null => {
        const entry = memoryCache.get(query.toLowerCase());
        if (!entry) return null;
        if ((Date.now() - entry.timestamp) > CONFIG.CACHE_TTL_MS) {
            memoryCache.delete(query.toLowerCase());
            return null;
        }
        return entry.data;
    },
    set: (query: string, data: College[]): void => {
        memoryCache.set(query.toLowerCase(), { data, timestamp: Date.now() });
    }
};

// --- DYNAMIC FIREBASE HELPER ---
const getFirestore = async () => {
    try {
        const adminModule = await import('firebase-admin');
        const admin = adminModule.default || adminModule;

        // Check if apps initialized
        if (admin.apps.length === 0) {
            // Attempt to initialize if not already done (though caller should usually do this)
            const key = process.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
            if (key) {
                const cert = admin.credential.cert;
                const serviceAccount = key.startsWith('{') ? JSON.parse(key) : {
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: key.replace(/\\n/g, '\n'),
                };

                admin.initializeApp({
                    credential: cert(serviceAccount)
                });
            }
        }

        return admin.firestore();
    } catch (e) {
        console.error("Dynamic Firebase Import Failed:", e);
        return null;
    }
};

// --- INGESTION ---
const ingestion = {
    saveToFallbackOnly: async (colleges: College[]) => {
        if (colleges.length === 0) return;
        try {
            const db = await getFirestore();
            if (!db) return;

            const batch = db.batch();
            const collectionRef = db.collection(CONFIG.FALLBACK_COLLECTION);

            let count = 0;
            for (const college of colleges) {
                const docId = `${college.name}-${college.state}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                const docRef = collectionRef.doc(docId);
                batch.set(docRef, {
                    ...college,
                    ingested_at: new Date().toISOString(),
                    source: 'fallback_api'
                }, { merge: true });
                count++;
                if (count >= 400) break;
            }
            await batch.commit();
            logger.info('Ingested to fallback collection', { count });
        } catch (error) {
            logger.error('Ingestion failed', error);
        }
    },

    searchInFallback: async (query: string): Promise<College[]> => {
        try {
            const db = await getFirestore();
            if (!db) return [];

            const collectionRef = db.collection(CONFIG.FALLBACK_COLLECTION);
            const q = collectionRef
                .where('name', '>=', query)
                .where('name', '<=', query + '\uf8ff')
                .limit(20);

            const snapshot = await q.get();
            if (snapshot.empty) return [];

            return snapshot.docs.map((doc: any) => {
                const data = doc.data();
                return {
                    name: data.name,
                    state: data.state,
                    city: data.city,
                    university: data.university,
                    type: data.type
                };
            });
        } catch (error) {
            logger.error('Fallback DB search failed', error);
            return [];
        }
    }
};

// --- API CLIENT ---
const apiClient = {
    fetchColleges: async (query: string): Promise<College[]> => {
        if (!CONFIG.ENABLED) return [];
        const url = `${CONFIG.API_URL}?name=${encodeURIComponent(query)}`;
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) return [];
            const data = await response.json();
            if (!Array.isArray(data)) return [];

            return data.map((item: any) => ({
                name: item.name || item['college name'] || 'Unknown College',
                state: item.state || 'Unknown State',
                city: item.city,
                university: item.university,
                type: item.type
            })).filter(c => c.name !== 'Unknown College');
        } catch (error) {
            logger.error('External API call failed', error);
            return [];
        }
    }
};

// --- MAIN SEARCH FUNCTION ---
export const searchCollegeFallback = async (query: string): Promise<College[]> => {
    if (!CONFIG.ENABLED) return [];
    if (!query || query.length < 3) return [];

    // 1. Check Cache
    const cachedResult = cache.get(query);
    if (cachedResult) return cachedResult;

    // 2. Check Fallback DB
    try {
        const dbResult = await ingestion.searchInFallback(query);
        if (dbResult && dbResult.length > 0) {
            cache.set(query, dbResult);
            return dbResult;
        }
    } catch (e) {
        // Continue to API
    }

    // 3. Ext API
    const apiResult = await apiClient.fetchColleges(query);
    if (apiResult && apiResult.length > 0) {
        ingestion.saveToFallbackOnly(apiResult).catch(() => { });
        cache.set(query, apiResult);
        return apiResult;
    }

    return [];
};
