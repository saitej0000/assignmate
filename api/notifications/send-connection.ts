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

    const { toId, fromId, senderName, type } = req.body;

    if (!toId || !fromId) {
        return res.status(400).json({ error: 'Missing IDs' });
    }

    try {
        const db = admin.firestore();

        // Get Recipient Tokens
        const tokensSnapshot = await db.collection('users').doc(toId).collection('fcm_tokens').get();
        if (tokensSnapshot.empty) {
            return res.status(200).json({ message: 'No tokens found for user' });
        }

        const tokens = tokensSnapshot.docs.map((d: any) => d.data().token).filter((t: any) => t);
        if (tokens.length === 0) return res.status(200).json({ message: 'No valid tokens' });

        // Fetch Sender Profile for Avatar (Optional but good)
        const senderDoc = await db.collection('users').doc(fromId).get();
        const senderData = senderDoc.exists ? senderDoc.data() : {};
        const senderAvatar = senderData?.avatar_url || 'https://assignmate.live/logo.png';

        const isAccepted = type === 'accepted';
        const title = isAccepted ? 'Connection Accepted' : 'New Connection Request';
        const body = isAccepted
            ? `${senderName || 'A user'} is now in your network.`
            : `${senderName || 'Someone'} wants to connect with you.`;

        const messagePayload = {
            tokens: tokens,
            notification: {
                title: title,
                body: body,
                imageUrl: senderAvatar
            },
            data: {
                url: `/users/${fromId}`, // Open the sender's profile
                type: isAccepted ? 'connection_accepted' : 'connection_request',
                click_action: `/users/${fromId}`
            },
            webpush: {
                headers: {
                    image: senderAvatar
                },
                notification: {
                    title: title,
                    body: body,
                    icon: senderAvatar,
                    image: senderAvatar
                },
                fcmOptions: {
                    link: `/users/${fromId}`
                }
            }
        };

        const response: any = await admin.messaging().sendEachForMulticast(messagePayload);

        // Cleanup
        const tokensToRemove: Promise<any>[] = [];
        response.responses.forEach((resp: any, idx: number) => {
            if (!resp.success) {
                const error = resp.error;
                if (error && (error.code === 'messaging/invalid-registration-token' ||
                    error.code === 'messaging/registration-token-not-registered')) {
                    const failedToken = tokens[idx];
                    const tokenDoc = tokensSnapshot.docs.find((d: any) => d.data().token === failedToken);
                    if (tokenDoc) {
                        tokensToRemove.push(tokenDoc.ref.delete());
                    }
                }
            }
        });

        await Promise.all(tokensToRemove);

        if (response.failureCount > 0 && response.successCount === 0) {
            return res.status(500).json({
                error: 'Delivery Failed',
                details: response.responses.map((r: any) => r.error?.code)
            });
        }

        return res.status(200).json({ success: true, count: response.successCount });

    } catch (error: any) {
        console.error('Send Connection Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
