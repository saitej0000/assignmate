import React, { useState, useEffect } from 'react';
import { dbService as db } from '../../services/firestoreService';
import { useToast } from '../../contexts/ToastContext';
import { Check, X, Loader2, Shield, AlertCircle } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';

export const AdminVerifications = () => {
    const { success, error } = useToast();
    const [pendingUsers, setPendingUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPending();
    }, []);

    const loadPending = async () => {
        setLoading(true);
        try {
            const users = await db.getPendingVerifications();
            setPendingUsers(users);
        } catch (e) {
            console.error(e);
            error("Failed to load pending verifications");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (userId: string, status: 'verified' | 'rejected') => {
        try {
            await db.verifyUser(userId, status);
            setPendingUsers(prev => prev.filter(u => u.id !== userId));
            success(`User ${status === 'verified' ? 'Verified' : 'Rejected'} Successfully`);
        } catch (e) {
            error("Action Failed");
        }
    };

    if (loading) return <div className="text-white flex items-center gap-2"><Loader2 className="animate-spin" /> Loading Verifications...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Shield className="text-orange-500" />
                Pending Verifications
                <span className="text-sm font-normal text-slate-400 ml-2">({pendingUsers.length})</span>
            </h2>

            {pendingUsers.length === 0 ? (
                <GlassCard className="p-12 text-center border border-slate-800 bg-slate-900/50">
                    <Check className="mx-auto mb-4 text-green-500 opacity-50" size={48} />
                    <p className="text-lg text-slate-300 font-medium">All caught up!</p>
                    <p className="text-slate-500">No pending verification requests.</p>
                </GlassCard>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {pendingUsers.map(user => (
                        <GlassCard key={user.id} className="p-6 border border-slate-800 bg-slate-900/50">
                            <div className="flex flex-col lg:flex-row gap-6">
                                {/* ID Card Image */}
                                <div className="w-full lg:w-1/3 aspect-video bg-slate-800 rounded-xl overflow-hidden border border-slate-700 relative group">
                                    {user.id_card_url ? (
                                        <>
                                            <img src={user.id_card_url} className="w-full h-full object-cover" alt="ID Card" />
                                            <a
                                                href={user.id_card_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                                            >
                                                View Full Size
                                            </a>
                                        </>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-slate-500 flex-col gap-2">
                                            <AlertCircle />
                                            <span>No ID Image</span>
                                        </div>
                                    )}
                                </div>

                                {/* User Details */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
                                                <img
                                                    src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                                                    className="w-full h-full object-cover rounded-full"
                                                    alt="Avatar"
                                                />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-xl text-white">{user.handle || 'Unknown User'}</h3>
                                                <p className="text-sm text-slate-400">{user.email}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">University</span>
                                                <p className="font-semibold text-slate-200 mt-1">{user.school || 'Not specified'}</p>
                                            </div>
                                            <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Submitted</span>
                                                <p className="font-semibold text-slate-200 mt-1">
                                                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mt-auto">
                                        <button
                                            onClick={() => handleVerify(user.id, 'verified')}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-900/20"
                                        >
                                            <Check size={18} /> Approve
                                        </button>
                                        <button
                                            onClick={() => handleVerify(user.id, 'rejected')}
                                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-red-400 border border-slate-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <X size={18} /> Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}
        </div>
    );
};
