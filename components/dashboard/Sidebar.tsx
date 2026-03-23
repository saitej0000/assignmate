import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { dbService } from '../../services/firestoreService';
import { useState, useEffect } from 'react';
import { Avatar } from '../ui/Avatar';

interface SidebarProps {
    user: User | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ user }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();
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

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/auth');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <aside className="w-72 h-full hidden lg:flex flex-col border-r border-gray-200 bg-gradient-to-b from-white to-gray-50/30 z-20 shrink-0" style={{ boxShadow: '4px 0 24px -12px rgba(0,0,0,0.08)' }}>
            <div className="h-20 flex items-center px-8 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
                <div className="flex items-center gap-3 text-text-dark cursor-pointer hover:scale-105 transition-transform duration-200" onClick={() => navigate('/feed')}>
                    <div className="size-9 rounded-xl flex items-center justify-center overflow-hidden">
                        <img src="/logo.png" alt="AssignMate" className="w-full h-full object-cover" />
                    </div>
                    <h2 className="text-xl font-extrabold tracking-tight">AssignMate</h2>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-6 py-2 flex flex-col gap-1">
                <div className="mb-2 px-4 text-xs font-bold text-text-muted uppercase tracking-wider">Main Menu</div>

                <a
                    onClick={() => navigate('/feed')}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group cursor-pointer ${isActive('/feed') ? 'bg-gradient-to-r from-primary/10 to-orange-500/5 text-primary ring-2 ring-primary/20 shadow-sm' : 'hover:bg-gray-100 hover:shadow-sm text-text-muted hover:text-text-dark'}`}
                >
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
                    <span className="text-sm font-bold">Dashboard</span>
                </a>

                <a
                    onClick={() => navigate('/projects')}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all group cursor-pointer ${isActive('/projects') ? 'bg-primary/10 text-primary ring-1 ring-primary/20' : 'hover:bg-secondary-bg text-text-muted'}`}
                >
                    <span className="material-symbols-outlined group-hover:text-text-dark transition-colors">assignment</span>
                    <span className="text-sm font-medium group-hover:text-text-dark transition-colors">My Projects</span>
                </a>

                <a
                    onClick={() => navigate('/peers')}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all group cursor-pointer ${isActive('/peers') ? 'bg-primary/10 text-primary ring-1 ring-primary/20' : 'hover:bg-secondary-bg text-text-muted'}`}
                >
                    <span className="material-symbols-outlined group-hover:text-text-dark transition-colors">person_search</span>
                    <span className="text-sm font-medium group-hover:text-text-dark transition-colors">Find Peers</span>
                </a>

                <a
                    onClick={() => navigate('/chats')}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all group cursor-pointer ${isActive('/chats') ? 'bg-primary/10 text-primary ring-1 ring-primary/20' : 'hover:bg-secondary-bg text-text-muted'}`}
                >
                    <span className="material-symbols-outlined group-hover:text-text-dark transition-colors">chat_bubble</span>
                    <span className="text-sm font-medium group-hover:text-text-dark transition-colors">Messages</span>
                    {unreadCount > 0 && (
                        <span className="ml-auto bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">{unreadCount}</span>
                    )}
                </a>

                <a
                    onClick={() => navigate('/community')}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all group cursor-pointer ${isActive('/community') ? 'bg-primary/10 text-primary ring-1 ring-primary/20' : 'hover:bg-secondary-bg text-text-muted'}`}
                >
                    <span className="material-symbols-outlined group-hover:text-text-dark transition-colors">forum</span>
                    <span className="text-sm font-medium group-hover:text-text-dark transition-colors">Community</span>
                </a>

                <div className="mt-6 mb-2 px-4 text-xs font-bold text-text-muted uppercase tracking-wider">Support</div>
                <a
                    onClick={() => navigate('/help-center')}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all group cursor-pointer ${isActive('/help-center') ? 'bg-primary/10 text-primary ring-1 ring-primary/20' : 'hover:bg-secondary-bg text-text-muted'}`}
                >
                    <span className="material-symbols-outlined group-hover:text-text-dark transition-colors">help</span>
                    <span className="text-sm font-medium group-hover:text-text-dark transition-colors">Help Center</span>
                </a>

                <div className="mt-6 mb-2 px-4 text-xs font-bold text-text-muted uppercase tracking-wider">Settings</div>
                <a
                    onClick={() => navigate('/profile')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group cursor-pointer ${isActive('/profile') ? 'bg-primary/10 text-primary ring-1 ring-primary/20' : 'hover:bg-secondary-bg text-text-muted'}`}
                >
                    <span className="material-symbols-outlined group-hover:text-text-dark transition-colors">person</span>
                    <span className="text-sm font-medium group-hover:text-text-dark transition-colors">Profile</span>
                </a>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group cursor-pointer hover:bg-red-50 text-text-muted hover:text-red-500 mt-auto"
                >
                    <span className="material-symbols-outlined transition-colors">logout</span>
                    <span className="text-sm font-medium transition-colors">Logout</span>
                </button>
            </nav>

            {/* User Profile Card */}
            <div className="p-6 border-t border-border-subtle">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-secondary-bg border border-border-subtle cursor-pointer hover:border-primary/30 transition-colors" onClick={() => navigate('/profile')}>
                    <div className="relative">
                        <Avatar
                            src={user?.avatar_url}
                            alt={user?.full_name}
                            className="size-10 rounded-full border border-white shadow-sm"
                            fallback={user?.full_name?.charAt(0)}
                        />
                        <div className={`absolute -bottom-0.5 -right-0.5 rounded-full size-3 border-2 border-white ${user?.is_online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    </div>
                    <div className="flex flex-col overflow-hidden flex-1">
                        <h1 className="text-text-dark text-sm font-bold truncate">{user?.full_name || user?.handle || 'Student'}</h1>
                        <p className="text-text-muted text-[11px] truncate">{user?.school || 'University'}</p>
                    </div>
                    <span className="material-symbols-outlined text-text-muted text-lg">chevron_right</span>
                </div>
            </div>
        </aside>
    );
};
