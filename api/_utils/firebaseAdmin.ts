// Lazy load firebase-admin to prevent top-level cold start crashes in Vercel
let adminInstance: any;

export const getFirebaseAdmin = async () => {
    if (adminInstance) return adminInstance;

    try {
        // Dynamic import
        const adminModule = await import('firebase-admin');
        const admin = adminModule.default || adminModule;

        if (!admin.apps.length) {
            const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
            if (key) {
                const serviceAccount = JSON.parse(key);
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                });
                console.log("Firebase Admin Initialized (Lazy)");
            } else {
                throw new Error("Missing Env Var: FIREBASE_SERVICE_ACCOUNT_KEY");
            }
        }

        adminInstance = admin;
        return admin;
    } catch (error: any) {
        console.error('Firebase Admin Lazy Init Error:', error.message);
        throw error;
    }
};
