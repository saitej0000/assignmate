import React, { useEffect, useState } from 'react';
import { presence } from '../services/firebase';

interface UserPresenceProps {
    userId: string;
    className?: string;
    showLastSeen?: boolean;
    size?: number;
}

export const UserPresence: React.FC<UserPresenceProps> = ({ userId, className = '', showLastSeen = false, size = 12 }) => {
    const [isOnline, setIsOnline] = useState(false);
    const [lastSeen, setLastSeen] = useState<number>(0);

    useEffect(() => {
        const unsubscribe = presence.listenToUserStatus(userId, (online, last) => {
            setIsOnline(online);
            setLastSeen(last);
        });
        return () => unsubscribe();
    }, [userId]);

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="relative flex" style={{ width: size, height: size }}>
                {isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full w-full h-full ${isOnline ? 'bg-green-500' : 'bg-slate-400'}`}></span>
            </div>
            {showLastSeen && !isOnline && lastSeen > 0 && (
                <span className="text-xs text-slate-500">
                    Last seen {new Date(lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            )}
            {showLastSeen && isOnline && (
                <span className="text-xs text-green-600 font-medium">Online</span>
            )}
        </div>
    );
};
