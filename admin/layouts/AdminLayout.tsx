import React, { useState } from 'react';
import { Users, MessageSquare, Activity, Settings, Link as LinkIcon, LogOut, Menu, X, Shield, CheckCircle } from 'lucide-react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

export const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    // Determine current page from path
    const currentPage = location.pathname.split('/').pop() || 'dashboard';

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <Activity size={20} /> },
        { id: 'users', label: 'Users', icon: <Users size={20} /> },
        { id: 'verifications', label: 'Verifications', icon: <Shield size={20} /> },
        { id: 'chats', label: 'Chats', icon: <MessageSquare size={20} /> },
        { id: 'connections', label: 'Connections', icon: <LinkIcon size={20} /> },
        { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
    ];

    const handleNavigate = (page: string) => {
        navigate(`/admin/${page}`);
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 flex font-sans">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/90 backdrop-blur-xl border-r border-slate-800 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:relative lg:translate-x-0`}
            >
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg overflow-hidden">
                            <img src="/logo.png" alt="AssignMate" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg text-white">Admin Panel</h1>
                            <p className="text-xs text-slate-500">v2.0.0 • Online</p>
                        </div>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleNavigate(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentPage === item.id
                                    ? 'bg-red-600/10 text-red-500 border border-red-600/20'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                {item.icon}
                                <span className="font-medium">{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-800">
                        <button
                            onClick={() => window.location.href = '/'}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
                        >
                            <LogOut size={20} />
                            <span className="font-medium">Exit Panel</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Topbar */}
                <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-6">
                    <button
                        className="lg:hidden text-slate-400 hover:text-white"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        <Menu size={24} />
                    </button>

                    <div className="flex items-center gap-4 ml-auto">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-medium text-white">Pasha Bhai</div>
                            <div className="text-xs text-red-500">Super Admin</div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                            <Users size={20} />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </div>
            </main>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
};
