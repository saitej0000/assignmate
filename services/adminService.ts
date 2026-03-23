import {
    collection,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
    query,
    orderBy,
    getDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { notifications } from './firebase';

const getDb = () => {
    if (!db) throw new Error("Firebase Firestore not initialized");
    return db;
};

export const adminApi = {
    // --- ANALYTICS ---
    getSystemStats: async () => {
        const usersSnap = await getDocs(collection(getDb(), 'users'));
        const chatsSnap = await getDocs(collection(getDb(), 'chats'));
        // Messages are subcollections, counting them all is expensive/hard without a counter. 
        // We'll mock message count or skip it for now.
        const connectionsSnap = await getDocs(collection(getDb(), 'connections'));

        return {
            totalUsers: usersSnap.size,
            totalChats: chatsSnap.size,
            totalMessages: 0, // Placeholder
            totalConnections: connectionsSnap.size,
            activeUsers: Math.floor(usersSnap.size * 0.4),
        };
    },

    // --- USERS ---
    getAllUsers: async () => {
        const q = query(collection(getDb(), 'users'), orderBy('created_at', 'desc'));
        const snap = await getDocs(q);
        return snap.docs.map(d => d.data());
    },

    deleteUser: async (userId: string) => {
        await deleteDoc(doc(getDb(), 'users', userId));
    },

    suspendUser: async (userId: string, isSuspended: boolean) => {
        await updateDoc(doc(getDb(), 'users', userId), { is_suspended: isSuspended });
        return true;
    },

    // --- CHATS ---
    getAllChats: async () => {
        const q = query(collection(getDb(), 'chats'), orderBy('updated_at', 'desc'));
        const snap = await getDocs(q);

        // Hydrate with user data
        return await Promise.all(snap.docs.map(async d => {
            const data = d.data();
            const posterSnap = await getDoc(doc(getDb(), 'users', data.poster_id));
            const writerSnap = await getDoc(doc(getDb(), 'users', data.writer_id));

            return {
                id: d.id,
                ...data,
                poster: posterSnap.exists() ? posterSnap.data() : null,
                writer: writerSnap.exists() ? writerSnap.data() : null
            };
        }));
    },

    getChatMessages: async (chatId: string) => {
        const q = query(collection(getDb(), 'chats', chatId, 'messages'), orderBy('created_at', 'asc'));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    deleteMessage: async (chatId: string, messageId: string) => {
        // Note: Firestore needs parent path for subcollections
        await deleteDoc(doc(getDb(), 'chats', chatId, 'messages', messageId));
    },

    // --- CONNECTIONS ---
    getAllConnections: async () => {
        const q = query(collection(getDb(), 'connections'), orderBy('created_at', 'desc'));
        const snap = await getDocs(q);

        return await Promise.all(snap.docs.map(async d => {
            const data = d.data();
            const reqSnap = await getDoc(doc(getDb(), 'users', data.requester_id));
            const recSnap = await getDoc(doc(getDb(), 'users', data.receiver_id));

            return {
                id: d.id,
                ...data,
                requester: reqSnap.exists() ? reqSnap.data() : null,
                receiver: recSnap.exists() ? recSnap.data() : null
            };
        }));
    },

    // --- NOTIFICATIONS ---
    sendSystemNotification: async (userId: string, message: string) => {
        await notifications.send(userId, 'System Admin', message, 'system_alert', 'system');
    },

    broadcastNotification: async (message: string) => {
        const users = await adminApi.getAllUsers();
        for (const user of users) {
            // @ts-ignore
            await notifications.send(user.id, 'System Announcement', message, 'broadcast', 'system');
        }
    }
};
