import { notifications } from './firebase';

export const notificationService = {
    sendConnectionRequest: async (receiverId: string, senderName: string) => {
        await notifications.send(
            receiverId,
            senderName,
            `sent you a connection request.`,
            '',
            'connection'
        );
    },

    sendConnectionAccepted: async (receiverId: string, senderName: string) => {
        await notifications.send(
            receiverId,
            senderName,
            `accepted your connection request.`,
            '',
            'connection'
        );
    },

    sendChatMessage: async (receiverId: string, senderName: string, content: string, chatId: string) => {
        await notifications.send(
            receiverId,
            senderName,
            content,
            chatId,
            'chat'
        );
    },

    sendWelcome: async (receiverId: string, userName: string) => {
        await notifications.send(
            receiverId,
            'AssignMate Team',
            `Welcome to AssignMate, ${userName}! Complete your profile to get started.`,
            '',
            'system'
        );
    },

    sendCommunityLike: async (receiverId: string, senderName: string, postId: string) => {
        await notifications.send(
            receiverId,
            senderName,
            `liked your discussion post.`,
            postId, // Using postId in the 'link'/chatId field or similar, handled by UI logic
            'community_like'
        );
    },

    sendCommunityComment: async (receiverId: string, senderName: string, postId: string, commentPreview: string) => {
        const preview = commentPreview.length > 50 ? commentPreview.substring(0, 50) + '...' : commentPreview;
        await notifications.send(
            receiverId,
            senderName,
            `commented: "${preview}"`,
            postId,
            'community_comment'
        );
    }
};
