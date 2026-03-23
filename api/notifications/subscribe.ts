import type { VercelRequest, VercelResponse } from '@vercel/node';

// Helper to init admin locally to avoid shared module crashes in Vercel
const getLocalFirebaseAdmin = async () => {
    // @ts-ignore
    const adminModule = await import('firebase-admin');
    const admin = adminModule.default || adminModule;

    if (!admin.apps.length) {
        const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        if (key) {
            const serviceAccount = JSON.parse(key);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        } else {
            throw new Error("Missing Env Var: FIREBASE_SERVICE_ACCOUNT_KEY");
        }
    }
    return admin;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    let admin: any;
    try {
        admin = await getLocalFirebaseAdmin();
    } catch (e: any) {
        console.error("Firebase Init Error:", e);
        return res.status(500).json({ error: `Server Config Error: ${e.message}` });
    }

    const { token, school } = req.body;

    if (!token) {
        return res.status(400).json({ error: 'Missing token' });
    }

    try {
        // Subscribe to Global
        await admin.messaging().subscribeToTopic(token, 'global_posts');

        // Subscribe to School if provided
        if (school) {
            const sanitizedSchool = school.replace(/[^a-zA-Z0-9]/g, '_');
            await admin.messaging().subscribeToTopic(token, `school_${sanitizedSchool}`);
        }

        return res.status(200).json({ success: true });
    } catch (error: any) {
        console.error('Subscribe Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
