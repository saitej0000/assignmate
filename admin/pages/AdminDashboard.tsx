import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, MessageSquare, Link as LinkIcon, Activity, ArrowUp, ArrowDown } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';

export const AdminDashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await adminApi.getSystemStats();
            setStats(data);
        } catch (e) {
            console.error("Failed to load stats", e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-white">Loading Dashboard...</div>;

    const cards = [
        { label: 'Total Users', value: stats?.totalUsers, icon: <Users className="text-blue-500" />, change: '+12%' },
        { label: 'Active Chats', value: stats?.totalChats, icon: <MessageSquare className="text-green-500" />, change: '+5%' },
        { label: 'Connections', value: stats?.totalConnections, icon: <LinkIcon className="text-purple-500" />, change: '+8%' },
        { label: 'Messages Sent', value: stats?.totalMessages, icon: <Activity className="text-orange-500" />, change: '+24%' },
    ];

    // Mock Data for Charts
    const activityData = [
        { name: 'Mon', users: 40, messages: 240 },
        { name: 'Tue', users: 30, messages: 139 },
        { name: 'Wed', users: 20, messages: 980 },
        { name: 'Thu', users: 27, messages: 390 },
        { name: 'Fri', users: 18, messages: 480 },
        { name: 'Sat', users: 23, messages: 380 },
        { name: 'Sun', users: 34, messages: 430 },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">System Overview</h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, i) => (
                    <GlassCard key={i} className="p-6 border border-slate-800 bg-slate-900/50">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-lg bg-slate-800">{card.icon}</div>
                            <span className="text-xs font-medium text-green-400 flex items-center gap-1">
                                {card.change} <ArrowUp size={12} />
                            </span>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">{card.value}</div>
                        <div className="text-sm text-slate-400">{card.label}</div>
                    </GlassCard>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <GlassCard className="p-6 border border-slate-800 bg-slate-900/50">
                    <h3 className="text-lg font-semibold text-white mb-6">User Activity</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={activityData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                />
                                <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} />
                                <Line type="monotone" dataKey="messages" stroke="#10b981" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                <GlassCard className="p-6 border border-slate-800 bg-slate-900/50">
                    <h3 className="text-lg font-semibold text-white mb-6">Traffic Sources</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={activityData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                />
                                <Bar dataKey="users" fill="#8b5cf6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};
