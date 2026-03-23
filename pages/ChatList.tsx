import React, { useEffect, useState } from 'react';
import { dbService as db } from '../services/firestoreService';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Loader2, UserPlus, Search, Edit3 } from 'lucide-react';
import { UserPresence } from '../components/UserPresence';
import { Sidebar } from '../components/dashboard/Sidebar';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { useNavigate } from 'react-router-dom';
import { MobileNav } from '../components/dashboard/MobileNav';

const MotionDiv = motion.div as any;

export const ChatList = ({ user, onSelect, selectedId }: { user: any, onSelect?: any, selectedId?: any }) => {
    const navigate = useNavigate();
    const [chats, setChats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'unread', 'active'
    const [search, setSearch] = useState('');

    // New Chat Dropdown State
    const [connections, setConnections] = useState<any[]>([]);
    const [showNewChat, setShowNewChat] = useState(false);
    const [loadingConnections, setLoadingConnections] = useState(false);

    useEffect(() => {
        const loadChats = () => {
            db.getChats(user.id).then(data => {
                setChats(data);
                setLoading(false);
            }).catch(err => {
                console.error("Failed to load chats:", err);
                setLoading(false);
            });
        };

        const loadConnections = () => {
            setLoadingConnections(true);
            db.getMyConnections(user.id).then(data => {
                setConnections(data);
                setLoadingConnections(false);
            }).catch(err => {
                console.error("Failed to load connections:", err);
                setLoadingConnections(false);
            });
        };

        // Initial Load
        loadChats();
        loadConnections();

        // Realtime Subscription
        const unsubscribe = db.listenToChats(user.id, (data) => {
            setChats(data);
            setLoading(false);
        });

        return () => { unsubscribe(); };
    }, [user.id]);

    const getTimeAgo = (dateStr: string) => {
        try {
            if (!dateStr) return '';
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return '';
            return formatDistanceToNow(d, { addSuffix: true }).replace('about ', '');
        } catch { return ''; }
    };

    const filteredChats = chats.filter(chat => {
        const matchesSearch = chat.other_handle?.toLowerCase().includes(search.toLowerCase());
        if (!matchesSearch) return false;
        if (filter === 'unread') return chat.unread_count > 0;
        return true;
    });

    const handleSelect = (id: string) => {
        navigate(`/chats/${id}`);
    };

    const startNewChat = async (peer: any) => {
        try {
            setShowNewChat(false);
            const chat = await db.createChat(null, user.id, peer.id);
            navigate(`/chats/${chat.id}`);
        } catch (error) {
            console.error("Failed to create chat:", error);
        }
    };

    // Helper to extract the *other* user from a connection object
    const getPeerFromConnection = (conn: any) => {
        return conn.participants.find((p: any) => p.id !== user.id) || {};
    };

    return (
        <div className="bg-background text-text-dark antialiased h-screen supports-[height:100dvh]:h-[100dvh] overflow-hidden flex selection:bg-primary/20 font-display">
            <Sidebar user={user} />

            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <DashboardHeader />

                <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-4 md:pt-8 pb-24">
                    <div className="max-w-4xl mx-auto h-full flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-3xl font-black tracking-tight text-text-main">Messages</h1>
                                <p className="text-sm font-medium text-secondary mt-1">Connect with peers and handle requests</p>
                            </div>

                            <div className="relative z-30">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowNewChat(!showNewChat)}
                                    className={`size-12 flex items-center justify-center rounded-2xl transition-all shadow-sm ${showNewChat ? 'bg-primary text-white shadow-primary/20 ring-4 ring-primary/10' : 'bg-white border border-border-light text-text-main hover:border-primary/30 hover:shadow-md'}`}
                                >
                                    <Edit3 size={20} strokeWidth={2.5} />
                                </motion.button>

                                {/* New Chat Dropdown */}
                                <AnimatePresence>
                                    {showNewChat && (
                                        <>
                                            <div className="fixed inset-0 z-20" onClick={() => setShowNewChat(false)}></div>
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                transition={{ duration: 0.2, ease: "easeOut" }}
                                                className="absolute right-0 top-14 w-80 sm:w-96 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 z-30 overflow-hidden"
                                            >
                                                <div className="p-5 border-b border-border-light/50 bg-gradient-to-br from-white to-gray-50/50">
                                                    <h3 className="font-bold text-text-main text-base">New Message</h3>
                                                    <p className="text-xs font-medium text-secondary mt-1">Select a connection to start chatting</p>
                                                </div>
                                                <div className="max-h-80 overflow-y-auto p-3 space-y-1 customized-scrollbar">
                                                    {loadingConnections ? (
                                                        <div className="p-8 flex justify-center text-primary">
                                                            <Loader2 className="animate-spin" size={24} />
                                                        </div>
                                                    ) : connections.length > 0 ? (
                                                        connections.map(conn => {
                                                            const peer = getPeerFromConnection(conn);
                                                            if (!peer.id) return null;
                                                            return (
                                                                <button
                                                                    key={conn.id}
                                                                    onClick={() => startNewChat(peer)}
                                                                    className="w-full p-3 flex items-center gap-4 hover:bg-gray-50/80 rounded-2xl transition-all text-left group"
                                                                >
                                                                    <div className="relative">
                                                                        <img src={peer.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${peer.handle}`} alt={peer.handle} className="size-12 rounded-full bg-gray-100 object-cover shadow-sm border-2 border-transparent group-hover:border-primary/20 transition-all" />
                                                                        <div className={`absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-[3px] border-white ${peer.is_online ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <h4 className="font-bold text-sm text-text-main group-hover:text-primary transition-colors truncate">
                                                                            {peer.full_name || peer.handle}
                                                                        </h4>
                                                                        <p className="text-xs font-medium text-secondary truncate mt-0.5">{peer.school || 'Student'}</p>
                                                                    </div>
                                                                    <div className="size-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                                        <MessageSquare size={14} className="ml-px" />
                                                                    </div>
                                                                </button>
                                                            )
                                                        })
                                                    ) : (
                                                        <div className="p-8 text-center flex flex-col items-center">
                                                            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-4 text-primary rotate-3">
                                                                <UserPlus size={24} strokeWidth={2.5} />
                                                            </div>
                                                            <p className="text-sm font-bold text-text-main">No connections yet</p>
                                                            <p className="text-xs text-secondary mt-1 mb-4 font-medium max-w-[200px] leading-relaxed">Connect with peers to start messaging and collaborating.</p>
                                                            <button onClick={() => navigate('/peers')} className="text-xs font-bold text-white bg-text-main px-4 py-2 rounded-xl hover:bg-black transition-colors">Find Peers</button>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Search & Filter */}
                        <div className="bg-white/60 backdrop-blur-md rounded-3xl p-2 shadow-sm border border-border-light mb-6 flex flex-col sm:flex-row items-center gap-2 relative z-10">
                            <div className="relative w-full sm:flex-1 group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Search size={18} className="text-secondary group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    className="block w-full pl-11 pr-4 py-3 rounded-2xl bg-white/50 border border-transparent text-sm font-bold text-text-main placeholder-secondary/70 focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                                    placeholder="Search conversations..."
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-1.5 w-full sm:w-auto p-1 bg-gray-100/50 rounded-2xl">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`flex-1 sm:flex-none flex items-center justify-center px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${filter === 'all' ? 'bg-white text-text-main shadow-sm border border-gray-200/50' : 'text-secondary hover:text-text-main hover:bg-white/50'}`}
                                >
                                    All Messages
                                </button>
                                <button
                                    onClick={() => setFilter('unread')}
                                    className={`flex-1 sm:flex-none flex items-center justify-center px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${filter === 'unread' ? 'bg-white text-text-main shadow-sm border border-gray-200/50' : 'text-secondary hover:text-text-main hover:bg-white/50'}`}
                                >
                                    Unread
                                    {chats.some(c => c.unread_count > 0) && (
                                        <span className="ml-1.5 flex size-2 rounded-full bg-primary shadow-sm shadow-primary/40 animate-pulse"></span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Chat List */}
                        <div className="flex-1 overflow-y-auto bg-white/60 backdrop-blur-md rounded-3xl p-3 sm:p-5 shadow-soft border border-white relative z-0">
                            {loading ? (
                                <div className="flex flex-col justify-center items-center h-40 gap-4">
                                    <Loader2 className="animate-spin text-primary" size={32} />
                                    <p className="text-sm font-bold text-secondary">Loading conversations...</p>
                                </div>
                            ) : filteredChats.length === 0 ? (
                                <MotionDiv initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full text-center p-8 lg:p-12">
                                    <div className="relative mb-6">
                                        <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full"></div>
                                        <div className="w-20 h-20 bg-gradient-to-br from-white to-gray-50 rounded-3xl flex items-center justify-center relative shadow-sm border border-white outline outline-4 outline-primary/5 rotate-3">
                                            <MessageSquare className="text-secondary/60" size={36} strokeWidth={1.5} />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-black text-text-main mb-2">No messages yet</h3>
                                    <p className="text-sm text-secondary font-medium max-w-xs leading-relaxed mb-6">Start a conversation with a writer or student to collaborate on upcoming assignments.</p>
                                    <button
                                        onClick={() => setShowNewChat(true)}
                                        className="bg-text-main text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-black transition-colors shadow-lg shadow-black/5"
                                    >
                                        Start a Chat
                                    </button>
                                </MotionDiv>
                            ) : (
                                <div className="space-y-2">
                                    <AnimatePresence>
                                        {filteredChats.map((chat, i) => {
                                            const otherId = chat.poster_id === user.id ? chat.writer_id : chat.poster_id;

                                            return (
                                                <MotionDiv
                                                    key={chat.id}
                                                    layout
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    transition={{ delay: i * 0.05, duration: 0.2 }}
                                                    onClick={() => handleSelect(chat.id)}
                                                    className={`group flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${chat.unread_count > 0 ? 'bg-white shadow-md border-transparent ring-1 ring-primary/10' : 'bg-transparent border border-transparent hover:bg-white hover:shadow-card hover:border-gray-100'}`}
                                                >
                                                    <div className="relative shrink-0">
                                                        <img
                                                            src={chat.other_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.other_handle}`}
                                                            alt={chat.other_handle}
                                                            className="bg-center bg-no-repeat bg-cover rounded-full size-14 shadow-sm object-cover bg-gray-50 border-2 border-white group-hover:border-primary/20 transition-colors"
                                                        />
                                                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                                                            <UserPresence userId={otherId} size={12} className="border-2 border-white shadow-sm" />
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col flex-1 min-w-0 justify-center">
                                                        <div className="flex justify-between items-baseline mb-1.5">
                                                            <h3 className={`font-bold text-[16px] truncate group-hover:text-primary transition-colors ${chat.unread_count > 0 ? 'text-text-main' : 'text-text-dark'}`}>
                                                                {chat.other_handle || 'Unknown'}
                                                            </h3>
                                                            <span className={`text-[11px] font-bold ${chat.unread_count > 0 ? 'text-primary' : 'text-secondary/70'}`}>
                                                                {getTimeAgo(chat.updated_at)}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between items-center gap-4">
                                                            <p className={`text-sm truncate ${chat.unread_count > 0 ? 'text-text-main font-bold' : 'text-secondary font-medium'}`}>
                                                                {chat.last_message || <span className="italic opacity-60">Start a conversation</span>}
                                                            </p>
                                                            {chat.unread_count > 0 && (
                                                                <span className="bg-gradient-to-r from-primary to-orange-500 text-white leading-none text-[11px] font-black px-2.5 py-1 rounded-full shadow-md shadow-primary/20">
                                                                    {chat.unread_count}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </MotionDiv>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <MobileNav />
        </div>
    );
};