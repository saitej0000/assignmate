import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize admin app if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

/**
 * Trigger: When a new message is added to a chat
 * Path: chats/{chatId}/messages/{messageId}
 */
export const onNewMessage = functions.firestore
    .document('chats/{chatId}/messages/{messageId}')
    .onCreate(async (snap, context) => {
        const message = snap.data();
        const { chatId } = context.params;

        if (!message || !message.sender_id) return;

        try {
            const chatDoc = await admin.firestore().collection('chats').doc(chatId).get();
            if (!chatDoc.exists) return;

            const chatData = chatDoc.data();
            const participants: string[] = chatData?.participants || [];
            const recipientIds = participants.filter((uid) => uid !== message.sender_id);

            if (recipientIds.length === 0) return;

            const senderName = message.sender_name || 'Someone';
            const messageBody = message.type === 'offer' ? 'Sent you a project offer' : (message.content || 'Sent a message');

            const sendPromises = recipientIds.map(async (uid) => {
                const tokensSnap = await admin.firestore()
                    .collection('users')
                    .doc(uid)
                    .collection('fcm_tokens')
                    .get();

                if (tokensSnap.empty) return;

                const tokens = tokensSnap.docs.map(t => t.data().token).filter(t => !!t);
                if (tokens.length === 0) return;

                // Create Multicast Message (V1 API)
                const messagePayload: admin.messaging.MulticastMessage = {
                    tokens: tokens,
                    notification: {
                        title: senderName,
                        body: messageBody,
                    },
                    data: {
                        type: 'chat',
                        chatId: chatId,
                        url: `/chats/${chatId}`,
                        click_action: `/chats/${chatId}` // Legacy support
                    },
                    webpush: {
                        fcmOptions: {
                            link: `/chats/${chatId}`
                        }
                    }
                };

                const response = await admin.messaging().sendEachForMulticast(messagePayload);

                // Cleanup Invalid Tokens
                const tokensToRemove: Promise<any>[] = [];
                response.responses.forEach((resp, index) => {
                    if (!resp.success && resp.error) {
                        const errorCode = resp.error.code;
                        if (errorCode === 'messaging/invalid-registration-token' ||
                            errorCode === 'messaging/registration-token-not-registered') {
                            tokensToRemove.push(tokensSnap.docs[index].ref.delete());
                        }
                    }
                });

                await Promise.all(tokensToRemove);
            });

            await Promise.all(sendPromises);

        } catch (error) {
            console.error('[onNewMessage] Error:', error);
        }
    });

/**
 * Trigger: When a new community post is created
 * Path: community_posts/{postId}
 */
export const onNewPost = functions.firestore
    .document('community_posts/{postId}')
    .onCreate(async (snap, context) => {
        const post = snap.data();
        if (!post) return;

        const scope = post.scope || 'global';
        const school = post.user_school;

        try {
            let topic = 'global_posts';
            let title = 'New Global Discussion';

            if (scope === 'campus' && school) {
                const sanitizedSchool = school.replace(/[^a-zA-Z0-9]/g, '_');
                topic = `school_${sanitizedSchool}`;
                title = `New in ${school}`;
            }

            const messagePayload: admin.messaging.Message = {
                topic: topic,
                notification: {
                    title: title,
                    body: post.content ? (post.content.substring(0, 100) + (post.content.length > 100 ? '...' : '')) : 'New post',
                },
                data: {
                    type: 'post',
                    postId: context.params.postId,
                    url: '/community'
                },
                webpush: {
                    fcmOptions: {
                        link: '/community'
                    }
                }
            };

            await admin.messaging().send(messagePayload);

        } catch (error) {
            console.error('[onNewPost] Error:', error);
        }
    });

/**
 * Trigger: When a token is written (Manage Topic Subscriptions)
 * Path: users/{userId}/fcm_tokens/{tokenId}
 */
export const onTokenWrite = functions.firestore
    .document('users/{userId}/fcm_tokens/{tokenId}')
    .onWrite(async (change, context) => {
        if (!change.after.exists) return;

        const data = change.after.data();
        const token = data?.token;
        const userId = context.params.userId;

        if (!token) return;

        try {
            await admin.messaging().subscribeToTopic(token, 'global_posts');

            const userDoc = await admin.firestore().collection('users').doc(userId).get();
            const userData = userDoc.data();

            if (userData && userData.school) {
                const sanitizedSchool = userData.school.replace(/[^a-zA-Z0-9]/g, '_');
                await admin.messaging().subscribeToTopic(token, `school_${sanitizedSchool}`);
            }

        } catch (error) {
            console.error('[onTokenWrite] Error:', error);
        }
    });

/**
 * Trigger: When a connection request is created
 * Path: requests/{requestId}
 */
export const onConnectionRequest = functions.firestore
    .document('requests/{requestId}')
    .onCreate(async (snap, context) => {
        const request = snap.data();
        if (!request) return;

        const toUserId = request.toId;
        const fromUserId = request.fromId;

        if (!toUserId || !fromUserId) return;

        try {
            const senderDoc = await admin.firestore().collection('users').doc(fromUserId).get();
            const senderName = senderDoc.data()?.full_name || 'Someone';

            const tokensSnap = await admin.firestore()
                .collection('users')
                .doc(toUserId)
                .collection('fcm_tokens')
                .get();

            if (tokensSnap.empty) return;

            const tokens = tokensSnap.docs.map(t => t.data().token).filter(Boolean);

            const messagePayload: admin.messaging.MulticastMessage = {
                tokens: tokens,
                notification: {
                    title: 'New Connection Request',
                    body: `${senderName} wants to connect with you.`,
                },
                data: {
                    type: 'connection_request',
                    fromUserId: fromUserId,
                    url: `/profile/${fromUserId}`
                },
                webpush: {
                    fcmOptions: {
                        link: `/profile/${fromUserId}`
                    }
                }
            };

            const response = await admin.messaging().sendEachForMulticast(messagePayload);

            const tokensToRemove: Promise<any>[] = [];
            response.responses.forEach((resp, index) => {
                if (!resp.success && resp.error) {
                    const errorCode = resp.error.code;
                    if (errorCode === 'messaging/invalid-registration-token' ||
                        errorCode === 'messaging/registration-token-not-registered') {
                        tokensToRemove.push(tokensSnap.docs[index].ref.delete());
                    }
                }
            });
            await Promise.all(tokensToRemove);

        } catch (error) {
            console.error('[onConnectionRequest] Error:', error);
        }
    });
