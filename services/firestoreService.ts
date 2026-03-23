import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    updateDoc,
    deleteDoc,
    addDoc,
    serverTimestamp,
    arrayUnion,
    arrayRemove,
    onSnapshot
} from 'firebase/firestore';

import { db, storage } from './firebase';
import { collegeService } from './collegeService';
import { notifications } from './firebase';

// Helper to get db instance safely
const getDb = () => {
    if (!db) throw new Error("Firebase Firestore not initialized");
    return db;
};

export const userApi = {
    logAction: async (userId: string, action: string, details: any = {}) => {
        try {
            await addDoc(collection(getDb(), 'audit_logs'), {
                user_id: userId,
                action,
                details,
                created_at: serverTimestamp()
            });
        } catch (e) {
            console.error("Failed to log action:", e);
        }
    },

    getProfile: async (id: string) => {
        const docRef = doc(getDb(), 'users', id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    },

    createProfile: async (id: string, metadata: any) => {
        // ✅ ISSUE 4 FIX: Validate required fields before creating profile
        // This prevents corrupted/incomplete profiles from being saved
        if (!id) {
            throw new Error('User ID is required to create a profile');
        }

        // Email is critical for auth flow - must be present
        if (!metadata.email && metadata.email !== '') {
            throw new Error('Email is required to create a profile');
        }

        const randomCollege = await collegeService.getRandomCollege();

        // Clean handle - generate one if not provided
        let baseHandle = metadata.handle || metadata.full_name || '';
        if (!baseHandle) {
            // Generate a default handle from user ID if nothing else is available
            baseHandle = 'user_' + id.substring(0, 8);
        }
        baseHandle = baseHandle.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');

        // Ensure handle has minimum length
        if (baseHandle.length < 3) {
            baseHandle = baseHandle + '_' + Math.random().toString(36).substring(2, 6);
        }

        // Check availability
        const q = query(collection(getDb(), 'users'), where('handle', '==', baseHandle));
        const snap = await getDocs(q);

        let uniqueHandle = baseHandle;
        // Check if any existing user with this handle is NOT the current user
        const isTaken = snap.docs.some(doc => doc.id !== id);

        if (isTaken) {
            // Handle taken by someone else, append suffix
            uniqueHandle = `${baseHandle}_${Math.random().toString(36).substring(2, 6)}`;
        }

        const newProfile = {
            id,
            handle: uniqueHandle,
            full_name: metadata.full_name || 'Student',
            email: metadata.email,
            avatar_url: metadata.avatar_url,
            school: metadata.school || randomCollege,
            bio: metadata.bio || '',
            // Search fields (lowercase)
            search_handle: uniqueHandle.toLowerCase(),
            search_name: (metadata.full_name || 'Student').toLowerCase(),
            search_school: (metadata.school || randomCollege).toLowerCase(),
            search_bio: (metadata.bio || '').toLowerCase(),
            created_at: new Date().toISOString(),
            is_verified: 'pending',
            xp: 0,
            tags: ['Student'],
            is_writer: metadata.is_writer || false,
            role: 'user' as 'user' | 'admin' | 'moderator',
            visibility: 'global' as 'global' | 'college', // Default to global visibility
            portfolio: [],
            saved_writers: [],
            total_earned: 0,
            on_time_rate: 100,
            response_time: 60, // 60 minutes default
            languages: ['English'],
            is_online: true,
            id_card_url: null,
            is_incomplete: metadata.is_incomplete ?? false,
            ai_profile: metadata.ai_profile || null // ✅ Save AI Profile if present
        };

        try {
            // Write to Firestore with timeout protection
            await Promise.race([
                setDoc(doc(getDb(), 'users', id), newProfile),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Database write timeout. Please check your connection.")), 10000)
                )
            ]);
        } catch (e) {
            console.error("createProfile: Failed", e);
            throw e;
        }

        return newProfile;
    },

    deleteProfile: async (id: string) => {
        const db = getDb();
        const { writeBatch, collection, query, where, getDocs, doc } = await import('firebase/firestore');

        // Helper to commit batches of 500
        const performBatchDelete = async (docs: any[]) => {
            const BATCH_SIZE = 500;
            for (let i = 0; i < docs.length; i += BATCH_SIZE) {
                const batch = writeBatch(db);
                const chunk = docs.slice(i, i + BATCH_SIZE);
                chunk.forEach(d => batch.delete(d.ref));
                await batch.commit();
            }
        };

        const docsToDelete: any[] = [];

        // 1. User Profile
        // We push a dummy object with a 'ref' property to match the structure expected by performBatchDelete
        docsToDelete.push({ ref: doc(db, 'users', id) });

        // 2. Connections
        const connectionsQ = query(collection(db, 'connections'), where('participants', 'array-contains', id));
        const connSnap = await getDocs(connectionsQ);
        connSnap.forEach(d => docsToDelete.push(d));

        // 3. Requests (Sent)
        const reqSentQ = query(collection(db, 'requests'), where('fromId', '==', id));
        const reqSentSnap = await getDocs(reqSentQ);
        reqSentSnap.forEach(d => docsToDelete.push(d));

        // 4. Requests (Received)
        const reqRecvQ = query(collection(db, 'requests'), where('toId', '==', id));
        const reqRecvSnap = await getDocs(reqRecvQ);
        reqRecvSnap.forEach(d => docsToDelete.push(d));

        // 5. Chats
        const chatsQ = query(collection(db, 'chats'), where('participants', 'array-contains', id));
        const chatsSnap = await getDocs(chatsQ);
        chatsSnap.forEach(d => docsToDelete.push(d));

        // Execute Batch Deletes
        await performBatchDelete(docsToDelete);
    },

};

import { User } from '../types';

// ... existing imports ...

export const dbService = {
    getAllUsers: async () => {
        try {
            // ✅ Filter out incomplete profiles at query level
            const q = query(
                collection(getDb(), 'users'),
                where('is_incomplete', '==', false),
                limit(50)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => doc.data());
        } catch (error) {
            console.error("Error fetching users:", error);
            return [];
        }
    },

    getUser: async (userId: string) => {
        const docRef = doc(getDb(), 'users', userId);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    },

    getUserProfile: async (userId: string) => {
        try {
            const docRef = doc(getDb(), 'users', userId);
            const docSnap = await getDoc(docRef);
            return docSnap.exists() ? docSnap.data() : null;
        } catch (error) {
            console.error("Error fetching user profile:", error);
            return null;
        }
    },

    getUserByHandle: async (handle: string) => {
        try {
            const q = query(collection(getDb(), 'users'), where('handle', '==', handle), limit(1));
            const snap = await getDocs(q);
            if (snap.empty) return null;
            return { id: snap.docs[0].id, ...snap.docs[0].data() };
        } catch (error) {
            console.error("Error fetching user by handle:", error);
            return null;
        }
    },

    getUsersBatch: async (userIds: string[]) => {
        const uniqueIds = Array.from(new Set(userIds)).filter(id => id);
        if (uniqueIds.length === 0) return new Map();

        const chunks = [];
        for (let i = 0; i < uniqueIds.length; i += 10) {
            chunks.push(uniqueIds.slice(i, i + 10));
        }

        const userMap = new Map();
        await Promise.all(chunks.map(async (chunk) => {
            const q = query(collection(getDb(), 'users'), where('id', 'in', chunk));
            const snap = await getDocs(q);
            snap.forEach(d => userMap.set(d.id, d.data()));
        }));

        return userMap;
    },

    getWriters: async (currentUser: User | null, filters: { college?: string, searchQuery?: string, tag?: string } = {}) => {
        const { college, searchQuery, tag } = filters;
        const usersRef = collection(getDb(), 'users');
        let writers: any[] = [];

        if (searchQuery && searchQuery.length >= 2) {
            // Perform Server-Side Search
            const lowerQuery = searchQuery.toLowerCase();
            const endQuery = lowerQuery + '\uf8ff';

            // We need to search across multiple fields. Firestore requires separate queries.
            // All must filter by is_writer == true.

            const queries = [];

            // 1. Search by Name
            queries.push(query(usersRef,
                where('is_writer', '==', true),
                where('search_name', '>=', lowerQuery),
                where('search_name', '<=', endQuery),
                limit(20)
            ));

            // 2. Search by Handle
            queries.push(query(usersRef,
                where('is_writer', '==', true),
                where('search_handle', '>=', lowerQuery),
                where('search_handle', '<=', endQuery),
                limit(20)
            ));

            // 3. Search by School (only if college filter is NOT set, otherwise we filter by college separately)
            if (!college) {
                queries.push(query(usersRef,
                    where('is_writer', '==', true),
                    where('search_school', '>=', lowerQuery),
                    where('search_school', '<=', endQuery),
                    limit(20)
                ));
            }

            const snapshots = await Promise.all(queries.map(q => getDocs(q)));
            const resultMap = new Map();
            snapshots.forEach(snap => {
                snap.docs.forEach(doc => resultMap.set(doc.id, doc.data()));
            });

            writers = Array.from(resultMap.values());

        } else {
            // Default: Fetch recent writers (existing logic)
            const constraints: any[] = [
                where('is_writer', '==', true),
                orderBy('created_at', 'desc'), // Explicit sort
                limit(50)
            ];

            if (college) {
                constraints.push(where('search_school', '==', college.toLowerCase()));
            }

            const q = query(usersRef, ...constraints);
            const snap = await getDocs(q);
            writers = snap.docs.map(d => d.data());
        }

        // Client-side filtering for remaining fields (Tags, College if search was used)
        if (college && searchQuery) {
            writers = writers.filter((w: any) => w.search_school === college.toLowerCase());
        }

        if (tag && tag !== 'All') {
            writers = writers.filter((w: any) => w.tags && w.tags.includes(tag));
        }

        return writers;
    },

    getDashboardWriters: async (college?: string, limitCount: number = 5, currentUserId?: string) => {
        const usersRef = collection(getDb(), 'users');
        const constraints: any[] = [
            where('is_writer', '==', true),
            // where('is_verified', '==', 'verified'), // Removed to show all writers
            limit(limitCount + 1) // Fetch one extra in case we filter out self
        ];

        if (college) {
            constraints.push(where('search_school', '==', college.toLowerCase()));
        }

        const q = query(usersRef, ...constraints);
        const snap = await getDocs(q);

        let writers = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        if (currentUserId) {
            writers = writers.filter((w: any) => w.id !== currentUserId);
        }

        return writers.slice(0, limitCount);
    },

    updateProfile: async (userId: string, updates: any) => {
        const docRef = doc(getDb(), 'users', userId);

        // Maintain search fields
        if (updates.full_name) updates.search_name = updates.full_name.toLowerCase();
        if (updates.school) updates.search_school = updates.school.toLowerCase();
        if (updates.handle) updates.search_handle = updates.handle.toLowerCase();
        if (updates.bio) updates.search_bio = updates.bio.toLowerCase();

        // Use setDoc with merge to safely update specific fields like fcm_token
        await setDoc(docRef, {
            ...updates,
            last_seen: new Date().toISOString()
        }, { merge: true });
        return { error: null };
    },



    addToPortfolio: async (userId: string, file: File) => {
        const { supabaseStorage } = await import('./supabaseStorage');

        // 1. Upload to Supabase (bucket selection handled by service)
        const path = `portfolio/${userId}/${Date.now()}_${file.name}`;
        const url = await supabaseStorage.uploadFile(file, path);

        // 2. Update Firestore
        const docRef = doc(getDb(), 'users', userId);
        await updateDoc(docRef, {
            portfolio: arrayUnion(url)
        });

        return url;
    },

    deleteFromPortfolio: async (userId: string, urlToDelete: string) => {
        const docRef = doc(getDb(), 'users', userId);
        await updateDoc(docRef, {
            portfolio: arrayRemove(urlToDelete)
        });
    },

    toggleSaveWriter: async (userId: string, writerId: string) => {
        const docRef = doc(getDb(), 'users', userId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) return;

        const currentSaved = docSnap.data().saved_writers || [];
        if (currentSaved.includes(writerId)) {
            await updateDoc(docRef, { saved_writers: arrayRemove(writerId) });
        } else {
            await updateDoc(docRef, { saved_writers: arrayUnion(writerId) });
        }
    },

    // --- CONNECTION SYSTEM ---
    // --- CONNECTION SYSTEM ---
    sendConnectionRequest: async (fromUserId: string, toUserId: string) => {
        const id = `${fromUserId}_${toUserId}`;
        await setDoc(doc(getDb(), 'requests', id), {
            id,
            fromId: fromUserId,
            toId: toUserId,
            status: 'pending',
            created_at: new Date().toISOString()
        });
    },

    respondToConnectionRequest: async (requestId: string, status: 'accepted' | 'rejected') => {
        const reqRef = doc(getDb(), 'requests', requestId);
        await updateDoc(reqRef, { status });

        if (status === 'accepted') {
            // Create the connection entry
            const reqSnap = await getDoc(reqRef);
            const reqData = reqSnap.data();
            if (!reqData) return;

            const connId = `${reqData.fromId}_${reqData.toId}`;
            await setDoc(doc(getDb(), 'connections', connId), {
                id: connId,
                participants: [reqData.fromId, reqData.toId],
                created_at: new Date().toISOString()
            });
        }
    },

    removeConnection: async (userId: string, otherUserId: string) => {
        // Find existing connection doc
        const connectionsRef = collection(getDb(), 'connections');
        // We know userId is a participant. We need the doc where otherUserId is ALSO a participant.
        const q = query(connectionsRef, where('participants', 'array-contains', userId));
        const snapshot = await getDocs(q);

        const connectionDoc = snapshot.docs.find(doc => {
            const data = doc.data();
            return data.participants.includes(otherUserId);
        });

        if (connectionDoc) {
            await deleteDoc(doc(getDb(), 'connections', connectionDoc.id));

            // Also clean up any lingering 'accepted' REQUESTS between these two to prevent re-creation confusion?
            // Optional, but good hygiene. 
            // For now, just removing the "fact" of connection is enough.
        }
    },

    logDisconnection: async (userId: string, disconnectedUserId: string, reason: string) => {
        try {
            await addDoc(collection(getDb(), 'disconnection_logs'), {
                reporter_id: userId,
                disconnected_user_id: disconnectedUserId,
                reason: reason, // Optional
                timestamp: serverTimestamp()
            });
        } catch (e) {
            console.error("Failed to log disconnection:", e);
        }
    },

    createSafetyReport: async (reporterId: string, type: string, details: string = '') => {
        try {
            await addDoc(collection(getDb(), 'safety_reports'), {
                reporter_id: reporterId,
                type: type,
                details: details,
                status: 'pending',
                created_at: serverTimestamp()
            });
            return { success: true };
        } catch (e) {
            console.error("Failed to create safety report:", e);
            throw e;
        }
    },

    getNetworkMap: async (currentUserId: string) => {
        if (!currentUserId) return {};
        // This fetches who I am connected to
        const connectionsRef = collection(getDb(), 'connections');
        const q = query(connectionsRef, where('participants', 'array-contains', currentUserId));
        const snapshot = await getDocs(q);

        const map: any = {};
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            const otherId = data.participants.find((id: string) => id !== currentUserId);
            if (otherId) map[otherId] = 'connected';
        });

        // Also check pending sent requests
        const requestsRef = collection(getDb(), 'requests');
        const sentQ = query(requestsRef, where('fromId', '==', currentUserId), where('status', '==', 'pending'));
        const sentSnap = await getDocs(sentQ);
        sentSnap.docs.forEach(doc => {
            map[doc.data().toId] = 'pending_sent';
        });

        // Check pending received requests
        const receivedQ = query(requestsRef, where('toId', '==', currentUserId), where('status', '==', 'pending'));
        const receivedSnap = await getDocs(receivedQ);
        receivedSnap.docs.forEach(doc => {
            map[doc.data().fromId] = 'pending_received';
        });

        return map;
    },

    getIncomingRequests: async (userId: string) => {
        if (!userId) return [];
        const q = query(
            collection(getDb(), 'requests'),
            where('toId', '==', userId),
            where('status', '==', 'pending')
        );
        const snap = await getDocs(q);

        // Join with profiles manually
        const rawRequests = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const requesterIds = rawRequests.map((r: any) => r.fromId);
        const userMap = await dbService.getUsersBatch(requesterIds);

        return rawRequests.map((r: any) => ({
            ...r,
            fromUser: userMap.get(r.fromId) || null
        }));
    },

    getMyConnections: async (userId: string) => {
        if (!userId) return [];
        const q = query(collection(getDb(), 'connections'), where('participants', 'array-contains', userId));
        const snap = await getDocs(q);

        const connections = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
        const otherIds = new Set<string>();

        connections.forEach(c => {
            const other = c.participants.find((id: string) => id !== userId);
            if (other) otherIds.add(other);
        });

        if (otherIds.size === 0) return [];

        const userMap = await dbService.getUsersBatch(Array.from(otherIds));

        // Return connections with hydrated participants for Profile.tsx
        return connections.map(c => ({
            ...c,
            participants: c.participants.map((id: string) => userMap.get(id) || { id })
        }));
    },

    searchStudents: async (queryText: string) => {
        if (!queryText || queryText.length < 2) return [];

        const lowerQuery = queryText.toLowerCase();

        const q1 = query(collection(getDb(), 'users'), where('search_handle', '>=', lowerQuery), where('search_handle', '<=', lowerQuery + '\uf8ff'), limit(5));
        const q2 = query(collection(getDb(), 'users'), where('search_name', '>=', lowerQuery), where('search_name', '<=', lowerQuery + '\uf8ff'), limit(5));
        const q3 = query(collection(getDb(), 'users'), where('search_school', '>=', lowerQuery), where('search_school', '<=', lowerQuery + '\uf8ff'), limit(5));

        const [s1, s2, s3] = await Promise.all([getDocs(q1), getDocs(q2), getDocs(q3)]);

        const results = new Map();
        [...s1.docs, ...s2.docs, ...s3.docs].forEach(d => {
            results.set(d.id, { id: d.id, ...d.data() });
        });

        return Array.from(results.values());
    },



    // --- ORDER MANAGEMENT ---
    updateOrderStatus: async (orderId: string, newStatus: 'in_progress' | 'completed' | 'cancelled', userId: string) => {
        const orderRef = doc(getDb(), 'orders', orderId);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) throw new Error("Order not found");

        const orderData = orderSnap.data();
        if (!orderData.participants.includes(userId)) {
            throw new Error("Unauthorized: You are not a participant in this project.");
        }

        const updates: any = {
            status: newStatus,
            updated_at: new Date().toISOString()
        };

        if (newStatus === 'completed') {
            updates.completion_percentage = 100;
        }

        await updateDoc(orderRef, updates);

        // If completed, increment 'projects_completed' for ALL participants
        if (newStatus === 'completed' && orderData.status !== 'completed') {
            const batch = (await import('firebase/firestore')).writeBatch(getDb());

            // Increment for all participants
            // We use increment(1) from firestore
            const { increment } = await import('firebase/firestore');

            orderData.participants.forEach((pid: string) => {
                const userRef = doc(getDb(), 'users', pid);
                batch.update(userRef, {
                    projects_completed: increment(1),
                    // Also ensure total_earned updates if it's the writer (logic can be refined later)
                });
            });

            await batch.commit();
        }
    },

    getProjectsByHirer: async (hirerId: string) => {
        try {
            const q = query(collection(getDb(), 'projects'), where('hirer_id', '==', hirerId));
            const snap = await getDocs(q);
            return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (error) {
            console.error("Error fetching projects:", error);
            return [];
        }
    },

    getAllTalent: async (filter: string = 'all') => {
        try {
            const q = query(collection(getDb(), 'users'), where('is_writer', '==', true));
            const snap = await getDocs(q);
            let talent = snap.docs.map(d => ({ id: d.id, ...d.data() }));

            if (filter === 'verified') {
                talent = talent.filter((t: any) => t.is_verified === 'verified');
            }
            return talent;
        } catch (error) {
            console.error("Error fetching all talent:", error);
            return [];
        }
    },

    getJobsByWriter: async (writerId: string) => {
        try {
            const q = query(collection(getDb(), 'orders'), where('writer_id', '==', writerId));
            const snap = await getDocs(q);
            return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (error) {
            console.error("Error fetching jobs by writer:", error);
            return [];
        }
    },

    // --- CHAT SYSTEM ---
    getChats: async (userId: string) => {
        try {
            if (!userId) return [];
            const q = query(collection(getDb(), 'chats'), where('participants', 'array-contains', userId));
            const snap = await getDocs(q);
            const chats = snap.docs.map(d => ({ id: d.id, ...d.data() }));

            // Sort manually
            chats.sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

            // Hydrate with user data
            const otherIds = chats.map((c: any) => c.poster_id === userId ? c.writer_id : c.poster_id);
            const userMap = await dbService.getUsersBatch(otherIds);

            return chats.map((c: any) => {
                const isPoster = c.poster_id === userId;
                const otherId = isPoster ? c.writer_id : c.poster_id;
                const other = userMap.get(otherId);

                return {
                    ...c,
                    gig_title: 'Direct Chat',
                    other_id: otherId,
                    other_handle: other?.handle || 'User',
                    other_avatar: other?.avatar_url,
                    unread_count: isPoster ? (c.unread_count_poster || 0) : (c.unread_count_writer || 0)
                };
            });
        } catch (error) {
            console.error("Error fetching chats:", error);
            return [];
        }
    },

    getChatDetails: async (chatId: string, userId: string) => {
        const docSnap = await getDoc(doc(getDb(), 'chats', chatId));
        if (!docSnap.exists()) throw new Error("Not found");

        const data = docSnap.data();
        const isPoster = data.poster_id === userId;
        const otherId = isPoster ? data.writer_id : data.poster_id;
        const otherSnap = await getDoc(doc(getDb(), 'users', otherId));
        const other = otherSnap.exists() ? otherSnap.data() : null;

        return {
            id: chatId,
            ...data,
            other_handle: other?.handle || 'Unknown',
            other_avatar: other?.avatar_url
        };
    },

    listenToChatDetails: (chatId: string, callback: (details: any) => void) => {
        return onSnapshot(doc(getDb(), 'chats', chatId), (doc) => {
            if (doc.exists()) {
                callback({ id: doc.id, ...doc.data() });
            } else {
                callback(null);
            }
        });
    },

    createChat: async (gigId: string | null, posterId: string, writerId: string) => {
        // 1. Query for existing chat with these exact participants
        const q = query(collection(getDb(), 'chats'), where('participants', 'array-contains', posterId));
        const snaps = await getDocs(q);
        const existing = snaps.docs.find(doc => {
            const data = doc.data();
            return data.participants && data.participants.includes(writerId);
        });

        if (existing) return { id: existing.id, ...existing.data() };

        // 2. If none, create new
        const newChatRef = doc(collection(getDb(), 'chats'));
        const newChat = {
            participants: [posterId, writerId],
            poster_id: posterId, // Keep for backward compatibility if needed
            writer_id: writerId, // Keep for backward compatibility if needed
            createdAt: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_message: '',
            unread_count_poster: 0,
            unread_count_writer: 0
        };
        await setDoc(newChatRef, newChat);
        return { id: newChatRef.id, ...newChat };
    },

    getMessages: async (chatId: string) => {
        const q = query(
            collection(getDb(), 'chats', chatId, 'messages'),
            orderBy('created_at', 'asc')
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },



    sendMessage: async (chatId: string, senderId: string, text: string, type: string = 'text', fileUrl: string = '') => {
        const newMessage = {
            sender_id: senderId,
            text,
            type,
            fileUrl,
            created_at: new Date().toISOString(),
            readBy: [senderId]
        };

        // 1. Add to subcollection
        const res = await addDoc(collection(getDb(), 'chats', chatId, 'messages'), newMessage);

        // 2. Update chat metadata
        // 2. Update chat metadata and unread counts
        const chatRef = doc(getDb(), 'chats', chatId);
        const chatSnap = await getDoc(chatRef);

        if (chatSnap.exists()) {
            const chatData = chatSnap.data();
            const isSenderPoster = chatData.poster_id === senderId;

            const updates: any = {
                last_message: type === 'text' ? text : `Sent an ${type}`,
                updated_at: new Date().toISOString()
            };

            // Increment unread count for the RECEIVER
            if (isSenderPoster) {
                // Sender is poster, increment writer's unread count
                updates.unread_count_writer = (chatData.unread_count_writer || 0) + 1;
            } else {
                // Sender is writer, increment poster's unread count
                updates.unread_count_poster = (chatData.unread_count_poster || 0) + 1;
            }

            await updateDoc(chatRef, updates);

            // 3. Notify
            const receiverId = isSenderPoster ? chatData.writer_id : chatData.poster_id;
            const senderSnap = await getDoc(doc(getDb(), 'users', senderId));
            const senderName = senderSnap.exists() ? senderSnap.data().handle : 'User';

            notifications.send(receiverId, senderName, type === 'text' ? text : 'Attachment sent', chatId);
        }

        return { id: res.id, ...newMessage };
    },

    markMessagesAsRead: async (chatId: string, readerId: string) => {
        const chatRef = doc(getDb(), 'chats', chatId);
        const chatSnap = await getDoc(chatRef);

        if (chatSnap.exists()) {
            const chatData = chatSnap.data();
            const isReaderPoster = chatData.poster_id === readerId;

            // Reset unread count for the READER
            const updates: any = {};
            if (isReaderPoster) {
                updates.unread_count_poster = 0;
            } else {
                updates.unread_count_writer = 0;
            }

            await updateDoc(chatRef, updates);
        }

        // Also mark individual messages as read (existing logic)
        const q = query(
            collection(getDb(), 'chats', chatId, 'messages'),
            where('sender_id', '!=', readerId)
        );
        const snap = await getDocs(q);
        const batch = (await import('firebase/firestore')).writeBatch(getDb());

        let count = 0;
        snap.docs.forEach(d => {
            const data = d.data();
            if (!data.readBy || !data.readBy.includes(readerId)) {
                batch.update(d.ref, {
                    readBy: arrayUnion(readerId),
                    read_at: new Date().toISOString() // Keep for backward compat
                });
                count++;
            }
        });

        if (count > 0) await batch.commit();
    },

    deleteMessage: async (chatId: string, messageId: string) => {
        try {
            await deleteDoc(doc(getDb(), 'chats', chatId, 'messages', messageId));
        } catch (error) {
            console.error("Error deleting message:", error);
            throw error;
        }
    },

    clearChat: async (chatId: string, userId: string) => {
        try {
            const chatRef = doc(getDb(), 'chats', chatId);

            // Use setDoc with merge to ensure 'cleared_at' map is created if it doesn't exist
            await setDoc(chatRef, {
                cleared_at: {
                    [userId]: new Date().toISOString()
                }
            }, { merge: true });

        } catch (error) {
            console.error("Error clearing chat:", error);
            throw error;
        }
    },

    listenToMessages: (chatId: string, callback: (messages: any[]) => void) => {
        const q = query(
            collection(getDb(), 'chats', chatId, 'messages'),
            orderBy('created_at', 'asc')
        );
        return onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            callback(messages);
        });
    },

    listenToChats: (userId: string, callback: (chats: any[]) => void) => {
        if (!userId) return () => { };

        const q = query(collection(getDb(), 'chats'), where('participants', 'array-contains', userId));

        // Cache to store user profiles and avoid re-fetching on every message
        const userCache = new Map<string, any>();

        return onSnapshot(q, async (snap) => {
            try {
                const chats = snap.docs.map(d => ({ id: d.id, ...d.data() }));

                // Sort
                chats.sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

                // Identify missing users
                const otherIds = chats.map((c: any) => c.poster_id === userId ? c.writer_id : c.poster_id);
                const missingIds = otherIds.filter(id => !userCache.has(id));

                // Fetch only missing users
                if (missingIds.length > 0) {
                    const newUsersMap = await dbService.getUsersBatch(missingIds);
                    newUsersMap.forEach((user, id) => userCache.set(id, user));
                }

                const hydrated = chats.map((c: any) => {
                    const isPoster = c.poster_id === userId;
                    const otherId = isPoster ? c.writer_id : c.poster_id;
                    const other = userCache.get(otherId);

                    return {
                        ...c,
                        gig_title: 'Direct Chat',
                        other_handle: other?.handle || 'User',
                        other_avatar: other?.avatar_url,
                        unread_count: isPoster ? (c.unread_count_poster || 0) : (c.unread_count_writer || 0)
                    };
                });
                callback(hydrated);
            } catch (error) {
                console.error("Error in listenToChats:", error);
            }
        }, (error) => {
            console.error("Error listening to chats:", error);
        });
    },

    listenToUnreadCount: (userId: string, callback: (count: number) => void) => {
        if (!userId) return () => { };

        const q = query(collection(getDb(), 'chats'), where('participants', 'array-contains', userId));

        return onSnapshot(q, (snap) => {
            let total = 0;
            snap.docs.forEach(d => {
                const c = d.data();
                const isPoster = c.poster_id === userId;
                total += isPoster ? (c.unread_count_poster || 0) : (c.unread_count_writer || 0);
            });
            callback(total);
        }, (error) => {
            console.error("Error listening to unread count:", error);
        });
    },

    // --- ADMIN METHODS ---
    getPendingVerifications: async () => {
        const q = query(collection(getDb(), 'users'), where('is_verified', '==', 'pending'));
        const snap = await getDocs(q);
        return snap.docs.map(d => d.data());
    },

    verifyUser: async (userId: string, status: 'verified' | 'rejected') => {
        const docRef = doc(getDb(), 'users', userId);
        await updateDoc(docRef, { is_verified: status });
    },

    // --- DASHBOARD METHODS ---
    getDashboardStats: async (userId: string) => {
        if (!userId) return { activeCount: 0, escrowBalance: 0, nextDeadline: null, nextDeadlineProject: null, activeOrders: [] };

        // 1. Get Active Orders (using participants for bidirectional visibility)
        const q = query(
            collection(getDb(), 'orders'),
            where('participants', 'array-contains', userId)
            // where('status', '==', 'in_progress') // Removed to avoid missing index issue. Filter client-side.
        );

        const snap = await getDocs(q);
        let allOrders = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));

        // Filter for active orders client-side
        let activeOrders = allOrders.filter(o => o.status === 'in_progress');

        // Sort in memory (client-side)
        activeOrders.sort((a, b) => {
            const tA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
            const tB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
            return tA - tB;
        });

        // 2. Calculate Stats
        const activeCount = activeOrders.length;
        const escrowBalance = activeOrders.reduce((sum, order) => sum + (order.amount || 0), 0);

        // 3. Next Deadline
        let nextDeadline = null;
        let nextDeadlineProject = null;

        if (activeOrders.length > 0) {
            const firstOrder = activeOrders[0];
            if (firstOrder.deadline) {
                const daysLeft = Math.ceil((new Date(firstOrder.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                nextDeadline = daysLeft > 0 ? daysLeft : 0;
                nextDeadlineProject = firstOrder.title;
            }
        }

        // 4. Hydrate Orders with "Other Party" Data (display as writer_handle for UI compat)
        const hydratedOrders = await Promise.all(activeOrders.map(async (order) => {
            // Find the ID of the other participant
            let otherId = null;
            if (order.participants && Array.isArray(order.participants)) {
                otherId = order.participants.find((uid: string) => uid !== userId);
            }
            // Fallback for legacy orders
            if (!otherId) {
                otherId = order.student_id === userId ? order.writer_id : order.student_id;
            }

            if (!otherId) {
                return {
                    ...order,
                    writer_handle: 'Unknown Participant',
                    writer_avatar: null,
                    writer_school: 'Unknown',
                    writer_verified: false
                };
            }

            try {
                const userSnap = await getDoc(doc(getDb(), 'users', otherId));
                if (userSnap.exists()) {
                    const u = userSnap.data();
                    return {
                        ...order,
                        writer_handle: u.handle || u.full_name || 'User',
                        writer_avatar: u.avatar_url,
                        writer_school: u.school,
                        writer_verified: u.is_verified === 'verified'
                    };
                } else {
                    return {
                        ...order,
                        writer_handle: 'Deleted User',
                        writer_avatar: null,
                        writer_school: 'Unknown',
                        writer_verified: false
                    };
                }
            } catch (e) {
                console.error("Error hydrating order peer:", e);
                return {
                    ...order,
                    writer_handle: 'Error Loading User',
                    writer_avatar: null,
                    writer_school: 'Unknown',
                    writer_verified: false
                };
            }
        }));

        return {
            activeCount,
            escrowBalance,
            nextDeadline,
            nextDeadlineProject,
            activeOrders: hydratedOrders
        };
    },

    // --- STORAGE METHODS ---
    uploadFile: async (file: File, path: string) => {
        const { supabaseStorage } = await import('./supabaseStorage');
        return await supabaseStorage.uploadFile(file, path);
    },

    uploadChatFile: async (chatId: string, file: File) => {
        const { supabaseStorage } = await import('./supabaseStorage');
        const path = `chat-files/${chatId}/${Date.now()}_${file.name}`;
        return await supabaseStorage.uploadFile(file, path);
    },

    saveChatFile: async (chatId: string, fileData: { name: string, url: string, type: string, size: number, uploadedBy: string }) => {
        const { addDoc, collection } = await import('firebase/firestore');
        const filesRef = collection(getDb(), 'chats', chatId, 'files');
        await addDoc(filesRef, {
            ...fileData,
            created_at: new Date().toISOString()
        });
    },

    findExistingChat: async (uid1: string, uid2: string) => {
        const q = query(collection(getDb(), 'chats'), where('participants', 'array-contains', uid1));
        const snaps = await getDocs(q);
        const existingDoc = snaps.docs.find(doc => {
            const data = doc.data();
            return data.participants && data.participants.includes(uid2);
        });
        return existingDoc ? existingDoc.id : null;
    },

    getConnectionStatus: async (uid1: string, uid2: string) => {
        const requestsRef = collection(getDb(), 'requests');

        // 1. Check if I sent a request (pending_sent)
        const qSent = query(requestsRef, where('fromId', '==', uid1), where('toId', '==', uid2), where('status', '==', 'pending'));
        const snapSent = await getDocs(qSent);
        if (!snapSent.empty) return 'pending_sent';

        // 2. Check if I received a request (pending_received)
        const qReceived = query(requestsRef, where('fromId', '==', uid2), where('toId', '==', uid1), where('status', '==', 'pending'));
        const snapReceived = await getDocs(qReceived);
        if (!snapReceived.empty) return 'pending_received';

        // 3. Check Actual Connection
        // Optimization: Query specifically for the connection document if ID is deterministic
        // Try both combinations just in case, though respondToConnectionRequest sorts it implicitly by creation logic?
        // Actually respondToConnectionRequest uses `reqData.fromId` and `toId`.
        // Let's rely on the participants array query which is safer.
        const connQ = query(collection(getDb(), 'connections'), where('participants', 'array-contains', uid1));
        const connSnap = await getDocs(connQ);
        const isConnected = connSnap.docs.some(doc => {
            const data = doc.data();
            return data.participants && data.participants.includes(uid2);
        });

        return isConnected ? 'connected' : 'none';
    },

    getCommunityPosts: async (collegeName?: string) => {
        try {
            const postsRef = collection(getDb(), 'community_posts');
            // Fetch more to allow for filtering
            const q = query(postsRef, orderBy('created_at', 'desc'), limit(100));
            const snap = await getDocs(q);

            let posts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

            if (collegeName) {
                // Campus Feed: Show Global posts + Campus posts from MY college
                posts = posts.filter(p =>
                    p.scope === 'global' ||
                    !p.scope ||
                    (p.scope === 'campus' && p.user_school === collegeName)
                );
            } else {
                // Global Feed: Show ONLY Global posts (and legacy posts)
                posts = posts.filter(p => p.scope === 'global' || !p.scope);
            }

            return posts;
        } catch (error) {
            console.error("Error fetching community posts:", error);
            return [];
        }
    },

    getUserPosts: async (userId: string) => {
        try {
            const postsRef = collection(getDb(), 'community_posts');
            // Ensure userId is valid
            if (!userId) return [];

            // Remove orderBy to avoid needing a composite index (user_id + created_at)
            const q = query(postsRef, where('user_id', '==', userId), limit(50));
            const snapshot = await getDocs(q);

            const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

            // Client-side sort
            return posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        } catch (error) {
            console.error("Error fetching user posts:", error);
            return [];
        }
    },

    createCommunityPost: async (postData: any) => {
        try {
            const docRef = await addDoc(collection(getDb(), 'community_posts'), {
                ...postData,
                created_at: new Date().toISOString(),
                likes: [],
                comments_count: 0
            });

            // Award XP (50 for new post)
            if (postData.user_id) {
                const { increment } = await import('firebase/firestore');
                const userRef = doc(getDb(), 'users', postData.user_id);
                await updateDoc(userRef, {
                    xp: increment(50)
                });
            }

            return { id: docRef.id, ...postData };
        } catch (error) {
            console.error("Error creating community post:", error);
            throw error;
        }
    },

    toggleLikePost: async (postId: string, userId: string) => {
        const postRef = doc(getDb(), 'community_posts', postId);
        const postSnap = await getDoc(postRef);
        if (!postSnap.exists()) return;

        const data = postSnap.data();
        const likes = data.likes || [];
        const ownerId = data.user_id;

        if (likes.includes(userId)) {
            await updateDoc(postRef, { likes: arrayRemove(userId) });
        } else {
            await updateDoc(postRef, { likes: arrayUnion(userId) });

            // Send Notification (if not owner)
            if (ownerId && ownerId !== userId) {
                try {
                    // Fetch sender details to pass name (or reliable on client side? Service best to fetch or pass user object)
                    // For speed, let's fetch sender doc quickly or assume standard flow handles it. 
                    // Optimization: Pass "User" or fetch. strict types says arguments. 
                    // Let's fetch sender profile quickly for the name.
                    const userDoc = await getDoc(doc(getDb(), 'users', userId));
                    const senderName = userDoc.exists() ? (userDoc.data().handle || userDoc.data().full_name || 'Someone') : 'Someone';

                    const { notificationService } = await import('./notificationService');
                    await notificationService.sendCommunityLike(ownerId, senderName, postId);
                } catch (e) {
                    console.error("Failed to send like notification", e);
                }
            }
        }
    },

    deleteCommunityPost: async (postId: string, userId: string) => {
        const postRef = doc(getDb(), 'community_posts', postId);
        const postSnap = await getDoc(postRef);
        if (!postSnap.exists()) throw new Error("Post not found");

        if (postSnap.data().user_id !== userId) {
            throw new Error("Unauthorized: You can only delete your own posts.");
        }

        await deleteDoc(postRef);
    },

    getComments: async (postId: string) => {
        try {
            const commentsRef = collection(getDb(), 'community_posts', postId, 'comments');
            const q = query(commentsRef, orderBy('created_at', 'asc'));
            const snap = await getDocs(q);
            return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (error) {
            console.error("Error fetching comments:", error);
            return [];
        }
    },

    addComment: async (postId: string, user: any, content: string, replyToId?: string, replyToHandle?: string) => {
        try {
            const commentsRef = collection(getDb(), 'community_posts', postId, 'comments');
            const newComment = {
                post_id: postId,
                user_id: user.id,
                user_handle: user.handle || user.full_name || 'Anonymous',
                user_avatar: user.avatar_url || null,
                content: content,
                created_at: new Date().toISOString(),
                reply_to_id: replyToId || null,
                reply_to_handle: replyToHandle || null
            };

            await addDoc(commentsRef, newComment);

            // Increment comment count on post
            const postRef = doc(getDb(), 'community_posts', postId);
            const postSnap = await getDoc(postRef);
            const { increment } = await import('firebase/firestore');

            await updateDoc(postRef, {
                comments_count: increment(1)
            });

            // Award XP (10 for comment)
            if (user.id) {
                const userRef = doc(getDb(), 'users', user.id);
                try {
                    await updateDoc(userRef, {
                        xp: increment(10)
                    });
                } catch (err) {
                    console.error("Failed to update XP for comment:", err);
                }
            }

            // NOTIFICATION LOGIC
            const senderName = user.handle || user.full_name || 'Someone';
            const { notificationService } = await import('./notificationService');

            // 1. Notify Reply Target (if a reply and target isn't sender)
            if (replyToId) {
                // We need to find WHO replyToId belongs to.
                // Optimistically we assume the UI passed reasonable data, but we need the userId of that comment.
                // Fetch the comment we replied to.
                const originalCommentRef = doc(getDb(), 'community_posts', postId, 'comments', replyToId);
                const originalCommentSnap = await getDoc(originalCommentRef);

                if (originalCommentSnap.exists()) {
                    const originalUserId = originalCommentSnap.data().user_id;
                    if (originalUserId && originalUserId !== user.id) {
                        await notificationService.sendCommunityComment(
                            originalUserId,
                            senderName,
                            postId,
                            `Replied: ${content}`
                        );
                    }
                }
            }

            // 2. Notify Post Owner (if not sender AND not already notified by being the reply target)
            // If I reply to the post owner's comment, condition 1 covered it. 
            // If I reply to someone else, post owner SHOULD also know? Yes.
            if (postSnap.exists()) {
                const ownerId = postSnap.data().user_id;
                // If owner is not sender...
                if (ownerId && ownerId !== user.id) {
                    // And if owner wasn't already notified (i.e., we didn't just reply to the owner's comment)
                    // We need to know if Condition 1 fired for Owner.
                    // This creates a double read or complex logic. 
                    // Simpler: Just notify Post Owner always (unless sender). They might get 2 notifications if they reuse the system.
                    // Let's send a distinct 'commented on your post' notification.

                    // Optimization: Check if we already notified this ID above.
                    // Since we can't easily share state across these blocks without variables:
                    let alreadyNotified = false;
                    if (replyToId) {
                        const originalCommentRef = doc(getDb(), 'community_posts', postId, 'comments', replyToId);
                        const originalSnap = await getDoc(originalCommentRef); // Double read? Firestore caches slightly.
                        if (originalSnap.exists() && originalSnap.data().user_id === ownerId) {
                            alreadyNotified = true;
                        }
                    }

                    if (!alreadyNotified) {
                        await notificationService.sendCommunityComment(ownerId, senderName, postId, content);
                    }
                }
            }

            return newComment;
        } catch (error) {
            console.error("Error adding comment:", error);
            throw error;
        }
    },

    deleteComment: async (postId: string, commentId: string, userId: string) => {
        const commentRef = doc(getDb(), 'community_posts', postId, 'comments', commentId);
        const postRef = doc(getDb(), 'community_posts', postId);

        const [commentSnap, postSnap] = await Promise.all([
            getDoc(commentRef),
            getDoc(postRef)
        ]);

        if (!commentSnap.exists()) throw new Error("Comment not found");

        const commentOwner = commentSnap.data().user_id;
        const postOwner = postSnap.exists() ? postSnap.data().user_id : null;

        // Allow deletion if User is Comment Owner OR Post Owner
        if (userId !== commentOwner && userId !== postOwner) {
            throw new Error("Unauthorized");
        }

        await deleteDoc(commentRef);

        // Decrement comment count
        const { increment } = await import('firebase/firestore');
        await updateDoc(postRef, {
            comments_count: increment(-1)
        });
    },

    // --- MISSING METHODS STUBS ---
    getProjectById: async (id: string) => {
        if (!id) return null;
        try {
            const docRef = doc(getDb(), 'orders', id);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                const data = snap.data();
                // Fetch writer/hirer details if needed, for now return raw data
                return { id: snap.id, ...data };
            }
            return null;
        } catch (error) {
            console.error("Error fetching project:", error);
            return null;
        }
    },

    sendOffer: async (chatId: string, senderId: string, senderName: string, offerData: any) => {
        const newMessage = {
            sender_id: senderId,
            sender_name: senderName,
            type: 'offer',
            offer: { ...offerData, status: 'pending' },
            created_at: new Date().toISOString(),
            readBy: [senderId]
        };
        const res = await addDoc(collection(getDb(), 'chats', chatId, 'messages'), newMessage);
        return { id: res.id, ...newMessage };
    },

    respondToOffer: async (chatId: string, messageId: string, userId: string, status: 'accepted' | 'rejected') => {
        console.log('[respondToOffer] Starting...', { chatId, messageId, userId, status });

        const msgRef = doc(getDb(), 'chats', chatId, 'messages', messageId);

        // 1. Update message status
        await updateDoc(msgRef, {
            'offer.status': status,
            'offer.responded_at': new Date().toISOString(),
            'offer.responded_by': userId
        });
        console.log('[respondToOffer] Message status updated to:', status);

        // 2. If Accepted, Create Order/Project
        if (status === 'accepted') {
            try {
                // Fetch Offer Details
                const msgSnap = await getDoc(msgRef);
                const msgData = msgSnap.data();
                const offer = msgData?.offer;

                if (!offer) {
                    console.error('[respondToOffer] No offer data found in message');
                    return;
                }
                console.log('[respondToOffer] Offer data:', offer);

                // Fetch Chat Details to identify participants
                const chatRef = doc(getDb(), 'chats', chatId);
                const chatSnap = await getDoc(chatRef);
                const chatData = chatSnap.data();

                if (!chatData) {
                    console.error('[respondToOffer] No chat data found');
                    return;
                }
                console.log('[respondToOffer] Chat data:', {
                    participants: chatData.participants,
                    poster_id: chatData.poster_id,
                    writer_id: chatData.writer_id
                });

                // Build participants array with defensive fallbacks
                let participants: string[] = [];
                if (chatData.participants && Array.isArray(chatData.participants) && chatData.participants.length >= 2) {
                    participants = chatData.participants;
                } else if (chatData.poster_id && chatData.writer_id) {
                    participants = [chatData.poster_id, chatData.writer_id];
                } else {
                    // Last resort: use the sender and responder
                    const senderId = msgData?.sender_id;
                    if (senderId && userId && senderId !== userId) {
                        participants = [senderId, userId];
                    } else {
                        console.error('[respondToOffer] Could not determine participants');
                        return;
                    }
                }

                console.log('[respondToOffer] Final participants:', participants);

                const orderData = {
                    title: offer.title || 'Untitled Project',
                    description: offer.description || '',
                    budget: offer.budget || 0,
                    amount: offer.budget || 0,
                    deadline: offer.deadline || null,
                    status: 'in_progress',
                    student_id: chatData.poster_id || participants[0],
                    writer_id: chatData.writer_id || participants[1],
                    created_at: new Date().toISOString(),
                    participants: participants,
                    chat_id: chatId
                };

                console.log('[respondToOffer] Creating order with data:', orderData);

                const orderRef = await addDoc(collection(getDb(), 'orders'), orderData);
                console.log('[respondToOffer] Order created successfully with ID:', orderRef.id);

            } catch (error) {
                console.error("[respondToOffer] Error creating project from offer:", error);
                throw error;
            }
        }
    },
    sendRenegotiation: async (chatId: string, orderId: string, senderId: string, senderName: string, offerData: any) => {
        const newMessage = {
            sender_id: senderId,
            sender_name: senderName,
            type: 'renegotiation',
            offer: { ...offerData, orderId, status: 'pending' },
            created_at: new Date().toISOString(),
            readBy: [senderId]
        };
        const res = await addDoc(collection(getDb(), 'chats', chatId, 'messages'), newMessage);

        // Notify
        const chatRef = doc(getDb(), 'chats', chatId);
        const chatSnap = await getDoc(chatRef);
        if (chatSnap.exists()) {
            const chatData = chatSnap.data();
            const isSenderPoster = chatData.poster_id === senderId;
            const receiverId = isSenderPoster ? chatData.writer_id : chatData.poster_id;
            const { notificationService } = await import('./notificationService');
            // Use a custom notification or generic 'New Offer'
            // For now standard offer notification might suffice but specific is better
            // Just relying on standard chat notification logic in sendMessage wrapper? 
            // sendRenegotiation writes directly, so we should trigger notification manually or refactor.
            // Let's manually trigger a generic "New Project Update" notification
            await notificationService.sendChatMessage(receiverId, senderName, "Sent a project update request", chatId);
        }

        return { id: res.id, ...newMessage };
    },

    respondToRenegotiation: async (chatId: string, messageId: string, userId: string, status: 'accepted' | 'rejected') => {
        const msgRef = doc(getDb(), 'chats', chatId, 'messages', messageId);

        // 1. Update message status
        await updateDoc(msgRef, {
            'offer.status': status,
            'offer.responded_at': new Date().toISOString(),
            'offer.responded_by': userId
        });

        // 2. If Accepted, Update EXISTING Order
        if (status === 'accepted') {
            try {
                const msgSnap = await getDoc(msgRef);
                const msgData = msgSnap.data();
                const offer = msgData?.offer;

                if (!offer || !offer.orderId) {
                    console.error('[respondToRenegotiation] No offer/orderId found');
                    return;
                }

                const orderRef = doc(getDb(), 'orders', offer.orderId);

                const updates: any = {};
                if (offer.budget) {
                    updates.budget = offer.budget;
                    updates.amount = offer.budget; // syncing both fields
                }
                if (offer.deadline) updates.deadline = offer.deadline;
                if (offer.description) updates.description = offer.description;
                if (offer.title) updates.title = offer.title;

                updates.updated_at = new Date().toISOString();

                await updateDoc(orderRef, updates);

            } catch (error) {
                console.error("Error updating project from renegotiation:", error);
                throw error;
            }
        }
    },
    submitProposal: async (jobId: string, proposalData: any) => {
        // 1. Get Job to find owner
        const orderRef = doc(getDb(), 'orders', jobId);
        const orderSnap = await getDoc(orderRef);
        if (!orderSnap.exists()) throw new Error("Project not found");
        const order = orderSnap.data();

        // 2. Create/Get Chat
        // We need sender (writer) and receiver (student)
        const writerId = proposalData.writer_id;
        const studentId = order.student_id;

        const chat = await dbService.createChat(jobId, studentId, writerId);

        // 3. Send Proposal Message
        await dbService.sendMessage(chat.id, writerId, `New Proposal for "${order.title}": ${proposalData.cover_letter}`, 'text');

        return chat.id;
    }
};
