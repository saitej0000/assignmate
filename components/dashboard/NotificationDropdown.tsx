import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '../../types';
import { notifications as notifService } from '../../services/firebase';

interface NotificationDropdownProps {
    notifications: Notification[];
    onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ notifications, onClose }) => {
    const navigate = useNavigate();

    const handleItemClick = async (notification: Notification) => {
        // Mark as read
        if (!notification.read) {
            await notifService.markAsRead(notification.id);
        }

        // Navigate based on type
        if (notification.type === 'chat' && notification.chatId && typeof notification.chatId === 'string' && !notification.chatId.includes('[object')) {
            navigate(`/chats/${notification.chatId}`);
        } else if (notification.type === 'connection') {
            navigate('/connections');
        } else if (notification.type === 'community_like' || notification.type === 'community_comment') {
            navigate('/community');
            // Future: Navigate to specific post using notification.chatId (which holds postId)
        }

        onClose();
    };

    if (notifications.length === 0) {
        return (
            <div className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-6 flex flex-col items-center justify-center z-50 animate-fade-in-up">
                <div className="size-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-gray-400">notifications_off</span>
                </div>
                <p className="text-gray-500 font-medium">No notifications yet</p>
            </div>
        );
    }

    return (
        <div className="absolute top-12 right-0 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in-up max-h-[400px] flex flex-col">
            <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-white sticky top-0 z-10">
                <h3 className="font-bold text-text-dark">Notifications</h3>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                    {notifications.filter(n => !n.read).length} New
                </span>
            </div>

            <div className="overflow-y-auto flex-1">
                {notifications.map((notification) => (
                    <div
                        key={notification.id}
                        onClick={() => handleItemClick(notification)}
                        className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 ${!notification.read ? 'bg-orange-50/50' : ''}`}
                    >
                        <div className={`size-10 rounded-full flex items-center justify-center flex-shrink-0 ${notification.type === 'chat' ? 'bg-blue-100 text-blue-600' :
                            notification.type === 'connection' ? 'bg-purple-100 text-purple-600' :
                                notification.type === 'community_like' ? 'bg-pink-100 text-pink-600' :
                                    notification.type === 'community_comment' ? 'bg-green-100 text-green-600' :
                                        'bg-orange-100 text-orange-600'
                            }`}>
                            <span className="material-symbols-outlined text-xl">
                                {notification.type === 'chat' ? 'chat' :
                                    notification.type === 'connection' ? 'person_add' :
                                        notification.type === 'community_like' ? 'thumb_up' :
                                            notification.type === 'community_comment' ? 'comment' :
                                                'notifications'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-text-dark leading-tight">
                                <span className="font-bold">{notification.senderName}</span> {notification.content}
                            </p>
                            <p className="text-xs text-text-muted mt-1">
                                {notification.timestamp ? formatDistanceToNow(notification.timestamp.toMillis ? notification.timestamp.toDate() : notification.timestamp, { addSuffix: true }) : 'Just now'}
                            </p>
                        </div>
                        {!notification.read && (
                            <div className="size-2 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
