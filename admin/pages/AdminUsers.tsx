import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminService';
import { GlassCard } from '../../components/ui/GlassCard';
import { Search, Trash2, Ban, Mail, CheckCircle, XCircle } from 'lucide-react';

export const AdminUsers = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await adminApi.getAllUsers();
            setUsers(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user? This is irreversible.')) return;
        try {
            await adminApi.deleteUser(id);
            setUsers(users.filter(u => u.id !== id));
        } catch (e) {
            alert('Failed to delete user');
        }
    };

    const handleSuspend = async (id: string) => {
        try {
            await adminApi.suspendUser(id, true);
            alert('User suspended (mock)');
        } catch (e) {
            alert('Failed to suspend');
        }
    };

    const filteredUsers = users.filter(u =>
        u.handle?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="text-white">Loading Users...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">User Management</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-red-500 w-64"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-800 text-slate-400 text-sm">
                            <th className="p-4 font-medium">User</th>
                            <th className="p-4 font-medium">Role</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium">Joined</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-300">
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="border-b border-slate-800/50 hover:bg-slate-900/50 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden">
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} alt={user.handle} className="w-full h-full object-cover rounded-full" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">
                                                    {user.handle?.[0]?.toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{user.handle}</div>
                                            <div className="text-xs text-slate-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${user.is_writer
                                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                        }`}>
                                        {user.is_writer ? 'Writer' : 'Student'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className="flex items-center gap-1 text-green-400 text-sm">
                                        <CheckCircle size={14} /> Active
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-slate-500">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </td>
                                <td className="p-4 text-right space-x-2">
                                    <button
                                        onClick={() => handleSuspend(user.id)}
                                        className="p-2 hover:bg-slate-800 rounded-lg text-amber-500 transition-colors"
                                        title="Suspend"
                                    >
                                        <Ban size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="p-2 hover:bg-red-900/20 rounded-lg text-red-500 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
