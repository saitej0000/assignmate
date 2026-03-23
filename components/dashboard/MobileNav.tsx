import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { dbService } from '../../services/firestoreService';

export const MobileNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (user?.id) {
            const unsubscribe = dbService.listenToUnreadCount(user.id, (count) => {
                setUnreadCount(count);
            });
            return () => unsubscribe();
        }
    }, [user?.id]);

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { icon: 'dashboard', label: 'Home', path: '/feed' },
        { icon: 'forum', label: 'Community', path: '/community' },
        { icon: 'search', label: 'Search', path: '/peers', isPrimary: true },
        { icon: 'chat_bubble', label: 'Chat', path: '/chats', badge: unreadCount },
        { icon: 'person', label: 'Profile', path: '/profile' },
    ];

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 pb-safe">
            <div className="max-w-md mx-auto relative px-2">

                {/* 5-Column Grid for perfect alignment */}
                <div className="grid grid-cols-5 h-[70px] items-end pb-2">

                    {navItems.map((item) => {
                        const active = isActive(item.path);

                        // 1. PRIMARY BUTTON (The Center Orange Circle)
                        if (item.isPrimary) {
                            return (
                                <div key={item.path} className="relative flex justify-center h-full">
                                    <button
                                        onClick={() => navigate(item.path)}
                                        className="absolute -top-6 bg-orange-500 rounded-full w-14 h-14 flex items-center justify-center text-white shadow-lg ring-4 ring-white transform transition-transform active:scale-95"
                                        aria-label={item.label}
                                    >
                                        <span className="material-symbols-outlined text-[28px]">
                                            {item.icon}
                                        </span>
                                    </button>
                                    {/* Optional: Label below the floating button if needed, usually omitted in this style */}
                                    <span className="self-end text-[10px] font-medium text-orange-500 mb-0.5">
                                        {item.label}
                                    </span>
                                </div>
                            );
                        }

                        // 2. STANDARD BUTTONS
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`flex flex-col items-center justify-end gap-1 h-full pb-1 transition-colors duration-200 
                                    ${active ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'}`
                                }
                            >
                                <div className="relative">
                                    <span
                                        className="material-symbols-outlined text-[26px]"
                                        style={{ fontVariationSettings: active ? "'FILL' 1, 'wght' 500" : "'FILL' 0, 'wght' 400" }}
                                    >
                                        {item.icon}
                                    </span>

                                    {/* Badge Logic */}
                                    {item.badge && item.badge > 0 && (
                                        <span className="absolute -top-1 -right-1.5 min-w-[16px] h-[16px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                                            {item.badge > 9 ? '9+' : item.badge}
                                        </span>
                                    )}
                                </div>

                                <span className={`text-[10px] font-medium ${active ? 'font-semibold' : ''}`}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};
