import type { VercelRequest, VercelResponse } from '@vercel/node';

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

    const { postId, content, scope, userSchool, userSchoolName } = req.body;

    if (!postId) {
        return res.status(400).json({ error: 'Missing postId' });
    }

    try {
        let topic = 'global_posts';
        let body = content;

        if (scope === 'campus' && userSchool) {
            const sanitizedSchool = userSchool.replace(/[^a-zA-Z0-9]/g, '_');
            topic = `school_${sanitizedSchool}`;
            body = `New in ${userSchoolName || 'Campus'}: ${content}`;
        }

        const messagePayload = {
            topic: topic,
            notification: {
                title: scope === 'campus' ? 'Null Class Discussion' : 'New Global Discussion',
                body: body ? (body.length > 100 ? body.substring(0, 100) + '...' : body) : 'New post shared'
            },
            data: {
                url: `/community`,
                postId: postId
            },
            webpush: {
                fcmOptions: {
                    link: `/community`
                }
            }
        };

        const response: any = await admin.messaging().send(messagePayload);
        return res.status(200).json({ success: true, messageId: response });

    } catch (error: any) {
        console.error('Send Post Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
