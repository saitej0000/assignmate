import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { Sidebar } from '../components/dashboard/Sidebar';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { useNavigate } from 'react-router-dom';
import { dbService as db } from '../services/firestoreService';
import { format } from 'date-fns';
import { Avatar } from '../components/ui/Avatar';
import { MobileNav } from '../components/dashboard/MobileNav';

interface FeedProps {
    user: User | null;
    onChat?: (peer: User) => void;
}

export const Feed: React.FC<FeedProps> = ({ user, onChat }) => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>({
        activeCount: 0,
        connectionsCount: 0,
        unreadMessages: 0,
        activeOrders: []
    });
    const [loading, setLoading] = useState(true);
    const [connections, setConnections] = useState<any[]>([]);
    const [recentChats, setRecentChats] = useState<any[]>([]);
    const [topWriters, setTopWriters] = useState<any[]>([]);
    const [peersAtCollege, setPeersAtCollege] = useState<any[]>([]);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            if (!user) return;
            try {
                setLoading(true);

                // Fetch all dashboard data in parallel
                const [statsData, rawConnections, chatsData, writersData, collegePeers] = await Promise.all([
                    db.getDashboardStats(user.id).catch(err => ({ activeCount: 0, activeOrders: [] })),
                    db.getMyConnections(user.id).catch(err => []),
                    db.getChats(user.id).catch(err => []),
                    db.getDashboardWriters(undefined, 3, user.id).catch(err => []), // Top writers generally
                    db.getDashboardWriters(user.school, 5, user.id).catch(err => []) // Peers at college
                ]);

                if (isMounted) {
                    setStats({
                        ...statsData,
                        connectionsCount: rawConnections.length,
                        unreadMessages: chatsData.filter((c: any) => (c.unread_count || 0) > 0).length || 0
                    });

                    // Transform raw connections to user objects for display
                    // The service returns connections where participants is an array of hydrated User objects
                    const transformedConnections = rawConnections
                        .map((conn: any) => {
                            const otherUser = conn.participants.find((p: any) => p.id !== user.id);

                            // Filter conditions
                            if (!otherUser) return null;
                            if (!otherUser.full_name && !otherUser.handle) return null;
                            if (otherUser.full_name === '?' || otherUser.handle === '?') return null;
                            if (otherUser.full_name === 'Deleted User') return null;

                            return {
                                id: otherUser?.id || conn.id,
                                full_name: otherUser?.full_name || otherUser?.handle || 'Unknown',
                                handle: otherUser?.handle || 'User',
                                avatar_url: otherUser?.avatar_url,
                                school: otherUser?.school
                            };
                        })
                        .filter((c: any) => c !== null);
                    setConnections(transformedConnections);

                    setRecentChats(chatsData);
                    setTopWriters(writersData);
                    setPeersAtCollege(collegePeers);
                }
            } catch (err) {
                console.error("Dashboard data fetching critical error:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();

        return () => { isMounted = false; };
    }, [user]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const dashboardMessages = [
        "Together we can achieve more than we ever could alone.",
        "Every challenge is an opportunity to learn something new today.",
        "Connect, collaborate, and create something amazing with your peers.",
        "Your unique perspective makes our community stronger.",
        "Great things happen when brilliant minds come together.",
        "Helping others is the fastest way to master a subject yourself.",
        "Small steps every day lead to big achievements over time.",
        "You are part of a network of future leaders and innovators.",
        "Share your knowledge and watch it grow exponentially.",
        "Success is a journey best shared with supportive friends.",
        "Don't hesitate to reach out; someone is waiting to help.",
        "Your potential is limitless when you stay curious and open.",
        "Learning is not a race, but a collaborative adventure.",
        "A problem shared is a problem halved—find your study buddy.",
        "Celebrate every milestone, no matter how small it seems.",
        "Stay inspired, stay connected, and keep pushing forward.",
        "The best way to predict the future is to create it together.",
        "Kindness and collaboration are the keys to true success.",
        "Every peer you meet has something valuable to teach you.",
        "Let's make today a day of progress and positive connection."
    ];

    const getDailyMessage = () => {
        const start = new Date(new Date().getFullYear(), 0, 0);
        const diff = (new Date().getTime() - start.getTime()) + ((start.getTimezoneOffset() - new Date().getTimezoneOffset()) * 60 * 1000);
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);
        return dashboardMessages[dayOfYear % dashboardMessages.length];
    };



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
                                    <span className="material-symbols-outlined text-[18px]">school</span>
                                    <span>STUDENT DASHBOARD • {format(new Date(), 'EEEE, MMM d')}</span>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center gap-3">
                                    {getGreeting()}, {user?.full_name?.split(' ')[0] || 'Student'}!
                                    <span className="text-4xl animate-wave">👋</span>
                                </h1>
                                <p className="text-white/90 text-lg max-w-xl mb-8 leading-relaxed">
                                    {getDailyMessage()}
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <button onClick={() => navigate('/peers')} className="bg-white text-[#FF6B4A] px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                                        <span className="material-symbols-outlined">person_search</span>
                                        Find Peers
                                    </button>

                                    <button onClick={() => navigate('/connections')} className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-white/30 transition-all">
                                        <span className="material-symbols-outlined">group</span>
                                        My Network
                                    </button>
                                </div>
                            </div>
                            {/* Decorative Circles */}
                            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full blur-2xl -ml-10 -mb-10"></div>
                        </div>

                        {/* Stats Cards Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Active Projects Card */}
                            <div onClick={() => navigate('/projects')} className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-gray-500 font-bold text-xs uppercase tracking-wider">Active Projects</h3>
                                    <div className="size-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-xl">assignment</span>
                                    </div>
                                </div>
                                <div className="flex items-end gap-2">
                                    <span className="text-4xl font-extrabold text-[#111827]">{stats.activeCount}</span>
                                    <span className="text-sm font-medium text-gray-400 mb-1">In progress</span>
                                </div>
                            </div>

                            {/* My Network Card */}
                            <div onClick={() => navigate('/connections')} className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-gray-500 font-bold text-xs uppercase tracking-wider">My Network</h3>
                                    <div className="size-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-xl">group</span>
                                    </div>
                                </div>
                                <div className="flex items-end justify-between">
                                    <div className="flex items-end gap-2">
                                        <span className="text-4xl font-extrabold text-[#111827]">{stats.connectionsCount}</span>
                                        <button className="text-sm font-bold text-blue-500 hover:text-blue-600 flex items-center gap-0.5 mb-1">
                                            View all <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Messages Card */}
                            <div onClick={() => navigate('/chats')} className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-gray-500 font-bold text-xs uppercase tracking-wider">Messages</h3>
                                    <div className="size-8 rounded-lg bg-green-50 text-green-500 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-xl">chat</span>
                                    </div>
                                </div>
                                <div className="flex items-end justify-between">
                                    <div className="flex items-end gap-2">
                                        <span className="text-4xl font-extrabold text-[#111827]">{recentChats.length}</span>
                                        <button className="text-sm font-bold text-green-500 hover:text-green-600 flex items-center gap-0.5 mb-1">
                                            Open chats <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                            {/* Left Column (2/3) */}
                            <div className="xl:col-span-2 space-y-8">

                                {/* Your Connections Section */}
                                <section className="bg-white rounded-[1.5rem] border border-gray-100 p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                                            <span className="material-symbols-outlined text-blue-500">diversity_3</span>
                                            Your Connections
                                        </h2>
                                        <button onClick={() => navigate('/connections')} className="text-sm font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1">
                                            View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                        </button>
                                    </div>

                                    {loading ? (
                                        <div className="flex gap-4 overflow-hidden">
                                            {[1, 2, 3].map(i => <div key={i} className="min-w-[140px] h-40 bg-gray-50 rounded-xl animate-pulse"></div>)}
                                        </div>
                                    ) : connections.length > 0 ? (
                                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                            {connections.map((conn) => (
                                                <div key={conn.id} className="min-w-[160px] bg-gray-50 rounded-xl p-4 flex flex-col items-center text-center border border-gray-100 hover:border-blue-200 transition-all">
                                                    <div className="relative mb-2">
                                                        <Avatar src={conn.avatar_url} alt={conn.full_name || conn.handle} className="size-12 rounded-full ring-2 ring-white" />
                                                        <span className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-white rounded-full"></span>
                                                    </div>
                                                    <h3 className="font-bold text-sm text-[#111827] truncate w-full mb-1">{conn.full_name?.split(' ')[0] || conn.handle}</h3>
                                                    <p className="text-[10px] text-gray-500 font-medium mb-3 truncate w-full">{conn.handle}</p>
                                                    <button onClick={() => onChat && onChat(conn)} className="w-full py-1.5 rounded-lg bg-orange-100 text-orange-600 text-xs font-bold hover:bg-orange-200 transition-colors flex items-center justify-center gap-1">
                                                        <span className="material-symbols-outlined text-sm">chat</span> Chat
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-gray-500 text-sm">No connections yet. Connect with peers!</p>
                                        </div>
                                    )}
                                </section>

                                {/* Active Projects Section */}
                                <section className="bg-white rounded-[1.5rem] border border-gray-100 p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                                            <span className="material-symbols-outlined text-orange-500">folder_open</span>
                                            Active Projects
                                            <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full">{stats.activeCount}</span>
                                        </h2>
                                        <button onClick={() => navigate('/projects')} className="text-sm font-bold text-gray-400 hover:text-gray-600">View All</button>
                                    </div>

                                    {stats.activeOrders && stats.activeOrders.length > 0 ? (
                                        <div className="space-y-4">
                                            {stats.activeOrders.map((order: any) => (
                                                <div key={order.id} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between group hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => navigate(`/projects/${order.id}`)}>
                                                    <div className="flex items-center gap-4">
                                                        <div className="size-12 rounded-lg bg-white flex items-center justify-center text-orange-500 shadow-sm">
                                                            <span className="material-symbols-outlined">article</span>
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h3 className="font-bold text-[#111827]">{order.title}</h3>
                                                                <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full">In Progress</span>
                                                            </div>
                                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                                <span>Due: {format(new Date(order.deadline), 'MMM d, yyyy')}</span>
                                                                {order.budget > 0 && (
                                                                    <span className="flex items-center gap-0.5 font-bold text-gray-900 bg-white border border-gray-200 px-1.5 py-0.5 rounded shadow-sm">
                                                                        ₹{order.budget.toLocaleString()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-2 text-right">
                                                            <Avatar src={order.writer_avatar} alt={order.writer_handle} className="size-8 rounded-full" />
                                                            <div className="hidden sm:block">
                                                                <p className="text-xs font-bold text-[#111827]">{order.writer_handle}</p>
                                                            </div>
                                                        </div>
                                                        <div className="w-24 bg-gray-200 rounded-full h-1.5 hidden sm:block">
                                                            <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${order.completion_percentage || 0}%` }}></div>
                                                        </div>
                                                        <span className="text-xs font-bold text-gray-600">{order.completion_percentage || 0}%</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                                            <p className="text-gray-500 font-medium">No active projects</p>
                                            <button onClick={() => navigate('/writers')} className="mt-2 text-orange-500 font-bold text-sm hover:underline">Post a new project</button>
                                        </div>
                                    )}
                                </section>
                            </div>

                            {/* Right Column (1/3) */}
                            <div className="space-y-8">
                                {/* Messages Section */}
                                <section className="bg-white rounded-[1.5rem] border border-gray-100 p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                                            <span className="material-symbols-outlined text-green-500">chat</span>
                                            Messages
                                        </h2>
                                        <button onClick={() => navigate('/chats')} className="text-sm font-bold text-gray-400 hover:text-gray-600">View All</button>
                                    </div>

                                    {recentChats.length > 0 ? (
                                        <div className="space-y-4">
                                            {recentChats.slice(0, 4).map((chat) => (
                                                <div key={chat.id} onClick={() => navigate(`/chats/${chat.id}`)} className="flex items-center gap-3 cursor-pointer group hover:bg-gray-50 p-2 rounded-xl transition-colors -mx-2">
                                                    <div className="relative">
                                                        <Avatar src={chat.other_avatar} alt={chat.other_handle} className="size-10 rounded-full" />
                                                        {(chat.unread_count || 0) > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold size-4 flex items-center justify-center rounded-full border border-white">{chat.unread_count}</span>}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-center mb-0.5">
                                                            <h4 className="font-bold text-sm text-[#111827] truncate">{chat.other_handle || 'User'}</h4>
                                                            <span className="text-[10px] text-gray-400">{chat.updated_at ? format(new Date(chat.updated_at), 'h:mm a') : ''}</span>
                                                        </div>
                                                        <p className={`text-xs truncate ${chat.unread_count > 0 ? 'text-[#111827] font-semibold' : 'text-gray-500'}`}>
                                                            {chat.last_message || 'Start a conversation'}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 text-center py-4">No recent messages</p>
                                    )}
                                </section>

                                {/* Top Writers Section */}
                                <section className="bg-white rounded-[1.5rem] border border-gray-100 p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                                            <span className="material-symbols-outlined text-amber-500">star</span>
                                            Top Trending
                                        </h2>
                                        <button onClick={() => navigate('/writers')} className="text-sm font-bold text-gray-400 hover:text-gray-600">See All</button>
                                    </div>

                                    <div className="space-y-4">
                                        {topWriters.map((writer) => (
                                            <div key={writer.id} className="flex items-center justify-between group cursor-pointer" onClick={() => navigate(`/profile/${writer.id}`)}>
                                                <div className="flex items-center gap-3">
                                                    <Avatar src={writer.avatar_url} alt={writer.handle} className="size-10 rounded-full" />
                                                    <div>
                                                        <h4 className="font-bold text-sm text-[#111827] group-hover:text-orange-500 transition-colors">{writer.handle}</h4>
                                                        <p className="text-[10px] text-gray-500">{writer.school}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                                                    <span className="material-symbols-outlined text-amber-500 text-[14px] filled">star</span>
                                                    <span className="text-xs font-bold text-[#111827]">{writer.rating || '5.0'}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Your College Section */}
                                <section className="bg-white rounded-[1.5rem] border border-gray-100 p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                                            <span className="material-symbols-outlined text-blue-500">school</span>
                                            Your College
                                        </h2>
                                    </div>

                                    <div className="space-y-4">
                                        {peersAtCollege.slice(0, 3).map((peer) => (
                                            <div key={peer.id} className="flex items-center justify-between group cursor-pointer" onClick={() => navigate(`/profile/${peer.id}`)}>
                                                <div className="flex items-center gap-3">
                                                    <Avatar src={peer.avatar_url} alt={peer.handle} className="size-10 rounded-full" />
                                                    <div>
                                                        <h4 className="font-bold text-sm text-[#111827]">{peer.handle}</h4>
                                                        <p className="text-[10px] text-gray-500">Student</p>
                                                    </div>
                                                </div>
                                                <span className="bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-md">PEER</span>
                                            </div>
                                        ))}
                                        <button onClick={() => navigate('/writers')} className="w-full py-3 bg-orange-50 text-orange-600 font-bold rounded-xl text-sm hover:bg-orange-100 transition-colors">
                                            View All from {user?.school?.split(' ')[0] || 'College'}
                                        </button>
                                    </div>
                                </section>

                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <MobileNav />
        </div>
    );
};
