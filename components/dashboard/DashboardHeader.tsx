import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dbService } from '../../services/firestoreService';
import { notifications as notifService } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';
import { SmartSearchBar } from './SmartSearchBar';

export const DashboardHeader: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Notification State
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const notifRef = useRef<HTMLDivElement>(null);

    // Handle click outside to close dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Subscribe to notifications
    useEffect(() => {
        if (!user) return;
        const unsubscribe = notifService.listen(user.id, (data) => {
            setNotifications(prev => [...prev, data]);
        });
        return () => unsubscribe();
    }, [user]);

    // Calculate unread count
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <header className="h-16 md:h-24 flex items-center justify-between px-4 py-4 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-30 transition-all duration-300 sticky top-0 md:relative">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-2 text-text-dark mr-4">
                <div className="size-8 rounded-lg flex items-center justify-center overflow-hidden">
                    <img src="/logo.png" alt="AssignMate" className="w-full h-full object-cover" />
                </div>
                <span className="text-lg font-extrabold tracking-tight hidden sm:block">AssignMate</span>
            </div>

            <SmartSearchBar className="hidden md:block flex-1 max-w-lg z-50" />
            <div className="flex items-center gap-2 sm:gap-3 ml-auto">
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`relative p-2 md:p-2.5 rounded-full transition-colors border shadow-sm group ${showNotifications ? 'bg-primary text-white border-primary border-opacity-50' : 'bg-white text-text-dark hover:bg-primary-light border-border-subtle'}`}
                    >
                        <span className="material-symbols-outlined group-hover:text-primary transition-colors text-[20px] md:text-[24px]">notifications</span>
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2.5 size-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                        )}
                    </button>
                    {showNotifications && (
                        <NotificationDropdown notifications={notifications} onClose={() => setShowNotifications(false)} />
                    )}
                </div>

                <button
                    onClick={() => navigate('/mentors')}
                    className="hidden lg:flex items-center justify-center rounded-full h-11 px-6 bg-white border border-border-subtle text-text-dark text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm"
                >
                    Find Peers
                </button>

            </div>
        </header>
    );
};
