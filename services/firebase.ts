import { initializeApp, getApps, getApp } from 'firebase/app';
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    deleteUser,
    signInAnonymously
} from 'firebase/auth';
import {
    getFirestore,
    collection,
    addDoc,
    onSnapshot,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    doc,
    setDoc,
    getDoc
} from 'firebase/firestore';
import {
    getMessaging,
    getToken,
    onMessage
} from 'firebase/messaging';
import { getStorage } from 'firebase/storage';
import { getDatabase, ref, onDisconnect, set, onValue, serverTimestamp as rtdbServerTimestamp } from 'firebase/database';

const firebaseConfig = {
    apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY,
    authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: (import.meta as any).env.VITE_FIREBASE_APP_ID,
    measurementId: (import.meta as any).env.VITE_FIREBASE_MEASUREMENT_ID,
    databaseURL: "https://assignmate-cfe7e-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const authInstance = getAuth(app);
const dbInstance = getFirestore(app);
const storageInstance = getStorage(app);

let messagingInstance: any;
let rtdbInstance: any;

export const isConfigured = true;

// Initialize RTDB safely
try {
    rtdbInstance = getDatabase(app);
} catch (e) {
    console.warn("RTDB Init Failed (Non-critical if not using Presence):", e);
}

try {
    messagingInstance = getMessaging(app);
} catch (e) {
    console.log("Messaging not supported (e.g., non-https or private mode)");
}

export const storage = storageInstance;
export const db = dbInstance;

// --- Notifications System (Firestore Based - Legacy/Internal) ---
export const notifications = {
    send: async (receiverId: string, senderName: string, content: string, chatId: string, type: 'chat' | 'connection' | 'system' | 'community_like' | 'community_comment' = 'chat') => {
        if (!dbInstance) return;
        try {
            await addDoc(collection(dbInstance, 'notifications'), {
                receiverId,
                senderName,
                content,
                chatId,
                type,
                read: false,
                timestamp: serverTimestamp()
            });
        } catch (e) {
            console.error("Notification Send Error", e);
        }
    },

    listen: (userId: string, onNotify: (data: any) => void) => {
        if (!dbInstance || !userId) return () => { };

        const q = query(
            collection(dbInstance, 'notifications'),
            where('receiverId', '==', userId),
            orderBy('timestamp', 'desc'),
            limit(10)
        );

        return onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const data = change.doc.data();
                    const now = Date.now();
                    const notifTime = data.timestamp?.toMillis ? data.timestamp.toMillis() : (data.timestamp || 0);

                    // Only notify for recent events (last 30 seconds) to avoid spam on load
                    if (now - notifTime < 30000) {
                        onNotify({ id: change.doc.id, ...data });
                    }
                }
            });
        }, (error) => {
            console.error("Notification Listener Error:", error);
        });
    },

    markAsRead: async (notificationId: string) => {
        if (!dbInstance) return;
        try {
            await setDoc(doc(dbInstance, 'notifications', notificationId), { read: true }, { merge: true });
        } catch (e) {
            console.error("Mark Read Error", e);
        }
    }
};

// --- FCM Service (Web Push) ---
export const fcm = {
    requestPermission: async (userId: string) => {
        if (!messagingInstance) return null;

        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                const currentToken = await getToken(messagingInstance, {
                    // Ideally use env var for VAPID key
                    vapidKey: "BBlG6uz8HQjkYoEfJxxcBhcUC8HFb3uWH2z4zEclEk7KUBG_zTQaFHyAFwzAmzmUKPRK7xxUveJNVCI3pV9yZNo"
                });

                if (currentToken) {
                    // Get or Create Device ID for this browser
                    let deviceId = localStorage.getItem('fcm_device_id');
                    if (!deviceId) {
                        deviceId = crypto.randomUUID(); // Modern browsers support this
                        localStorage.setItem('fcm_device_id', deviceId);
                    }

                    // Save token to Firestore subcollection using safe Device ID
                    // Path: users/{userId}/fcm_tokens/{deviceId}
                    const tokenRef = doc(dbInstance, 'users', userId, 'fcm_tokens', deviceId);
                    await setDoc(tokenRef, {
                        token: currentToken, // The actual FCM token
                        deviceId: deviceId,
                        platform: 'web',
                        last_updated: serverTimestamp()
                    });
                    return currentToken;
                }
            }
        } catch (err) {
            console.log('An error occurred while retrieving token. ', err);
        }
        return null;
    },

    onForegroundMessage: (callback: (payload: any) => void) => {
        if (messagingInstance) {
            onMessage(messagingInstance, (payload) => {
                callback(payload);
            });
        }
    }
};

// --- Presence System (Realtime Database) ---
export const presence = {
    init: (userId: string) => {
        if (!rtdbInstance) return;

        const userStatusDatabaseRef = ref(rtdbInstance, '/status/' + userId);
        const isOfflineForDatabase = {
            state: 'offline',
            last_changed: rtdbServerTimestamp(),
        };
        const isOnlineForDatabase = {
            state: 'online',
            last_changed: rtdbServerTimestamp(),
        };

        const connectedRef = ref(rtdbInstance, '.info/connected');
        onValue(connectedRef, (snapshot) => {
            if (snapshot.val() === false) {
                return;
            }

            onDisconnect(userStatusDatabaseRef).set(isOfflineForDatabase).then(() => {
                set(userStatusDatabaseRef, isOnlineForDatabase);
            });
        });
    },

    listenToUserStatus: (userId: string, callback: (isOnline: boolean, lastSeen: number) => void) => {
        if (!rtdbInstance) return () => { };
        const userStatusRef = ref(rtdbInstance, '/status/' + userId);
        return onValue(userStatusRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                callback(data.state === 'online', data.last_changed);
            } else {
                callback(false, 0);
            }
        });
    },

    setTypingStatus: (chatId: string, userId: string, isTyping: boolean) => {
        if (!rtdbInstance) return;
        const typingRef = ref(rtdbInstance, `/typing/${chatId}/${userId}`);
        set(typingRef, isTyping);
    },

    listenToTypingStatus: (chatId: string, userId: string, callback: (isTyping: boolean) => void) => {
        if (!rtdbInstance) return () => { };
        const typingRef = ref(rtdbInstance, `/typing/${chatId}/${userId}`);
        return onValue(typingRef, (snapshot) => {
            callback(snapshot.val() === true);
        });
    }
};

// --- Authentication Service ---
export const auth = {
    login: async (email: string, password: string) => {
        try {
            const res = await signInWithEmailAndPassword(authInstance, email, password);
            return { data: { user: res.user } };
        } catch (error: any) {
            return { error };
        }
    },
    register: async (email: string, password: string) => {
        try {
            const res = await createUserWithEmailAndPassword(authInstance, email, password);
            return { data: { user: res.user } };
        } catch (error: any) {
            return { error };
        }
    },
    loginWithGoogle: async () => {
        try {
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });
            const res = await signInWithPopup(authInstance, provider);
            return { data: { user: res.user } };
        } catch (error: any) {
            return { error };
        }
    },
    loginAnonymously: async () => {
        try {
            const res = await signInAnonymously(authInstance);
            return { data: { user: res.user } };
        } catch (error: any) {
            return { error };
        }
    },
    logout: async () => {
        if (authInstance) await signOut(authInstance);
    },
    deleteUser: async () => {
        if (authInstance?.currentUser) {
            try {
                await deleteUser(authInstance.currentUser);
                return { success: true };
            } catch (e: any) {
                return { error: e };
            }
        }
        return { error: { message: "No user" } };
    },
    resetPassword: async (email: string) => {
        try {
            await sendPasswordResetEmail(authInstance, email);
            return { success: true };
        } catch (error: any) {
            return { error };
        }
    },
    onAuthStateChange: (callback: (user: any) => void) => {
        if (!authInstance) return () => { };
        return onAuthStateChanged(authInstance, callback);
    },
    get currentUser() {
        return authInstance?.currentUser;
    }
};