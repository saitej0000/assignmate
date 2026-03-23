import React, { useEffect, useState } from 'react';
import { dbService as db } from '../services/firestoreService';
import { Sidebar } from '../components/dashboard/Sidebar';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { Loader2, MessageSquare, X, Check, Search } from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';

export const Connections = ({ user }: { user: User }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'network' | 'pending'>('network');
    const [connections, setConnections] = useState<any[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!user) return;
        const loadData = async () => {
            setLoading(true);
            try {
                const [myConns, myReqs] = await Promise.all([
                    db.getMyConnections(user.id),
                    db.getIncomingRequests(user.id)
                ]);
                setConnections(myConns);
                setRequests(myReqs);
            } catch (error) {
                console.error("Failed to load connections:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [user]);

    const handleMessage = async (targetUserId: string) => {
        try {
            const existingChatId = await db.findExistingChat(user.id, targetUserId);
            if (existingChatId) {
                navigate(`/chats/${existingChatId}`);
            } else {
                const chat = await db.createChat(null, user.id, targetUserId);
                navigate(`/chats/${chat.id}`);
            }
        } catch (error) {
            console.error("Failed to start chat", error);
        }
    };

    const handleAccept = async (req: any) => {
        await db.respondToConnectionRequest(req.id, 'accepted');
        window.location.reload();
    };

    const handleReject = async (req: any) => {
        await db.respondToConnectionRequest(req.id, 'rejected');
        window.location.reload();
    };

    const filteredConnections = connections.filter(conn => {
        const otherUser = Array.isArray(conn.participants)
            ? conn.participants.find((p: any) => p.id !== user.id) || conn.participants[0]
            : null;

        // Filter out Deleted/Invalid Users
        if (!otherUser) return false;
        if (!otherUser.full_name && !otherUser.handle) return false;
        if (otherUser.full_name === '?' || otherUser.handle === '?') return false;
        if (otherUser.full_name === 'Deleted User') return false;

        const q = searchQuery.toLowerCase();
        return (otherUser.full_name?.toLowerCase() || '').includes(q) ||
            (otherUser.handle?.toLowerCase() || '').includes(q) ||
            (otherUser.school?.toLowerCase() || '').includes(q);
    });

    return (
        <div className="bg-background text-text-dark antialiased h-screen overflow-hidden flex selection:bg-primary/20 font-display">
            <Sidebar user={user} />

            <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#F9FAFB]">
                <DashboardHeader />

                <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-4 pb-20">
                    <div className="max-w-7xl mx-auto space-y-8">

                        {/* Hero Section */}
                        <div className="bg-gradient-to-r from-[#FF8C42] to-[#FF5E62] rounded-[2rem] p-8 md:p-10 text-white shadow-lg relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 text-white/80 text-sm font-medium mb-2">
                                    <span className="material-symbols-outlined text-[18px]">group</span>
                                    <span>NETWORK & CONNECTIONS</span>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                                    Your Professional Network
                                </h1>
                                <p className="text-white/90 text-lg max-w-xl mb-8 leading-relaxed">
                                    Manage your connections and pending requests. Build your network to collaborate and grow together.
                                </p>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setActiveTab('network')}
                                        className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === 'network'
                                            ? 'bg-white text-[#FF6B4A] shadow-lg scale-105'
                                            : 'bg-white/20 text-white hover:bg-white/30'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined">diversity_3</span>
                                        Connections <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full ml-1">{connections.length}</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('pending')}
                                        className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === 'pending'
                                            ? 'bg-white text-[#FF6B4A] shadow-lg scale-105'
                                            : 'bg-white/20 text-white hover:bg-white/30'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined">person_add</span>
                                        Requests <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full ml-1">{requests.length}</span>
                                    </button>
                                </div>
                            </div>
                            {/* Decorative Circles */}
                            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full blur-2xl -ml-10 -mb-10"></div>
                        </div>

                        {/* Search Bar (Only for network tab) */}
                        {activeTab === 'network' && (
                            <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex items-center max-w-2xl">
                                <div className="pl-4 text-gray-400">
                                    <Search size={20} />
                                </div>
                                <input
                                    type="text"
                                    className="flex-1 bg-transparent border-none h-12 px-4 text-base outline-none placeholder:text-gray-400 font-medium text-gray-700"
                                    placeholder="Search connections by name or college..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        )}

                        {/* Content Area */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {loading ? (
                                <div className="col-span-full flex justify-center py-20">
                                    <Loader2 className="animate-spin text-orange-500 size-10" />
                                </div>
                            ) : (
                                <>
                                    {activeTab === 'network' && (
                                        filteredConnections.length > 0 ? (
                                            filteredConnections.map(conn => {
                                                const otherUser = Array.isArray(conn.participants)
                                                    ? conn.participants.find((p: any) => p.id !== user.id) || conn.participants[0]
                                                    : null;

                                                if (!otherUser) return null;

                                                return (
                                                    <div key={conn.id} className="bg-white rounded-[1.5rem] border border-gray-100 p-6 shadow-sm hover:shadow-md hover:border-orange-100 transition-all group">
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="relative">
                                                                <Avatar src={otherUser.avatar_url} alt={otherUser.full_name} className="size-16 rounded-full ring-4 ring-gray-50 group-hover:ring-orange-50 transition-all" />
                                                                <div className="absolute bottom-0 right-0 size-4 bg-green-500 border-2 border-white rounded-full"></div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleMessage(otherUser.id)}
                                                                className="size-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all shadow-sm"
                                                                title="Message"
                                                            >
                                                                <MessageSquare size={18} />
                                                            </button>
                                                        </div>

                                                        <div className="mb-4">
                                                            <h3 className="font-bold text-lg text-slate-900 truncate">{otherUser.full_name || otherUser.handle}</h3>
                                                            <p className="text-sm text-slate-500 truncate flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-sm">school</span>
                                                                {otherUser.school || 'Student'}
                                                            </p>
                                                        </div>

                                                        <div className="flex gap-2">
                                                            <button onClick={() => navigate(`/profile/${otherUser.id}`)} className="flex-1 py-2.5 rounded-xl bg-gray-50 text-gray-600 font-bold text-sm hover:bg-gray-100 transition-colors">
                                                                View Profile
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="col-span-full text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-200">
                                                <div className="bg-gray-50 size-20 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                                    <span className="material-symbols-outlined text-4xl">group_off</span>
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900">No connections found</h3>
                                                <p className="text-gray-500 mb-6">Start connecting with peers to build your network.</p>
                                                <button onClick={() => navigate('/peers')} className="bg-[#FF6B4A] text-white px-6 py-2.5 rounded-full font-bold shadow-lg hover:shadow-orange-200 transition-all">
                                                    Find Peers
                                                </button>
                                            </div>
                                        )
                                    )}

                                    {activeTab === 'pending' && (
                                        requests.length > 0 ? (
                                            requests.map(req => (
                                                <div key={req.id} className="bg-white rounded-[1.5rem] border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all">
                                                    <div className="flex items-center gap-4 mb-4">
                                                        <Avatar src={req.fromUser?.avatar_url} alt={req.fromUser?.full_name} className="size-14 rounded-full ring-2 ring-gray-50" />
                                                        <div>
                                                            <h3 className="font-bold text-slate-900">{req.fromUser?.full_name || 'User'}</h3>
                                                            <p className="text-xs text-slate-500">Wants to connect with you</p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <button
                                                            onClick={() => handleReject(req)}
                                                            className="py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all flex items-center justify-center gap-2"
                                                        >
                                                            <X size={16} /> Decline
                                                        </button>
                                                        <button
                                                            onClick={() => handleAccept(req)}
                                                            className="py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                                                        >
                                                            <Check size={16} /> Accept
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-full text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-200">
                                                <div className="bg-gray-50 size-20 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                                    <span className="material-symbols-outlined text-4xl">inbox</span>
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900">No pending requests</h3>
                                                <p className="text-gray-500">You're all caught up!</p>
                                            </div>
                                        )
                                    )}
                                </>
                            )}
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};
