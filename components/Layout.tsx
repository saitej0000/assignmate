import React, { ReactNode } from 'react';
import { MessageSquare, User as UserIcon, LogOut, Search, LogIn, Compass, Home } from 'lucide-react';
import { User } from '../types';

interface LayoutProps {
    children?: ReactNode;
    user: User | null;
    page: string;
    setPage: (page: string) => void;
    onLogout: () => Promise<void>;
}

export const Layout = ({ children, user, page, setPage, onLogout }: LayoutProps) => (
    <div className="min-h-screen flex flex-col md:flex-row font-sans text-slate-900 bg-background dark:bg-background-dark transition-colors duration-300">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-72 flex-col sticky top-0 h-screen border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl z-50">
            <div className="p-8 cursor-pointer" onClick={() => setPage('feed')}>
                <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="AssignMate" className="h-10 w-auto object-contain" />
                    <span className="font-display font-bold text-xl tracking-tight">AssignMate</span>
                </div>
            </div>

            <nav className="space-y-2 flex-1 px-6 mt-4">
                <NavBtn label="Discover" icon={<Compass size={20} />} active={page === 'feed'} onClick={() => setPage('feed')} />

                {user && (
                    <>
                        <NavBtn label="Messages" icon={<MessageSquare size={20} />} active={page === 'chats'} onClick={() => setPage('chats')} />
                        <NavBtn label="Profile" icon={<UserIcon size={20} />} active={page === 'profile'} onClick={() => setPage('profile')} />
                    </>
                )}
            </nav>

            <div className="p-6 border-t border-slate-200 dark:border-slate-800">
                {user ? (
                    <button onClick={onLogout} className="flex items-center gap-3 text-slate-500 hover:text-red-500 text-sm px-4 py-3 transition-colors w-full font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10">
                        <LogOut size={18} /> Sign Out
                    </button>
                ) : (
                    <button onClick={() => setPage('auth')} className="w-full btn-primary py-3">
                        <LogIn size={18} className="mr-2" /> Login
                    </button>
                )}
            </div>
        </aside>

        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl z-20">
            <div className="flex items-center gap-2" onClick={() => setPage('feed')}>
                <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
                <span className="font-bold text-lg">AssignMate</span>
            </div>
            {!user && (
                <button onClick={() => setPage('auth')} className="text-xs bg-primary text-white px-4 py-2 rounded-full font-bold shadow-lg shadow-orange-500/20">
                    Login
                </button>
            )}
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative">
            <div className="max-w-7xl mx-auto w-full min-h-full pb-24 md:pb-8 pt-6 px-4 md:px-8">
                {children}
            </div>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[safe-area-inset-bottom+80px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 flex justify-around items-center z-30 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)] px-2">
            <MobileNavBtn label="Home" icon={<Home size={24} />} active={page === 'home'} onClick={() => setPage('/')} />
            <MobileNavBtn label="Explore" icon={<Compass size={24} />} active={page === 'feed'} onClick={() => setPage('feed')} />
            {user ? (
                <>
                    <MobileNavBtn label="Chats" icon={<MessageSquare size={24} />} active={page === 'chats'} onClick={() => setPage('chats')} />
                    <MobileNavBtn label="Profile" icon={<UserIcon size={24} />} active={page === 'profile'} onClick={() => setPage('profile')} />
                </>
            ) : (
                <MobileNavBtn label="Login" icon={<LogIn size={24} />} active={page === 'auth'} onClick={() => setPage('auth')} />
            )}
        </nav>
    </div>
);

interface NavBtnProps {
    label: string;
    icon: ReactNode;
    active: boolean;
    onClick: () => void;
}

const NavBtn = ({ label, icon, active, onClick }: NavBtnProps) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold duration-200 ${active ? 'bg-orange-50 dark:bg-orange-500/10 text-primary shadow-sm ring-1 ring-orange-200 dark:ring-orange-500/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
        <span className={active ? 'text-primary' : ''}>{icon}</span>
        <span className="text-sm">{label}</span>
    </button>
);

const MobileNavBtn = ({ label, icon, active, onClick }: NavBtnProps) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center w-full h-16 rounded-2xl transition-all duration-300 ${active ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}>
        <div className={`p-1 rounded-full transition-all duration-300 ${active ? '-translate-y-1' : ''}`}>
            {icon}
        </div>
        <span className={`text-[10px] font-bold ${active ? 'opacity-100' : 'opacity-0 h-0'}`}>{label}</span>
    </button>
);