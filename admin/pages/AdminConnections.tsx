import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminService';
import { Search, Link as LinkIcon, Check, X } from 'lucide-react';

export const AdminConnections = () => {
    const [connections, setConnections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadConnections();
    }, []);

    const loadConnections = async () => {
        try {
            const data = await adminApi.getAllConnections();
            setConnections(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-white">Loading Connections...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Connection Requests</h2>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-800 text-slate-400 text-sm">
                            <th className="p-4">Requester</th>
                            <th className="p-4">Receiver</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Date</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-300">
                        {connections.map(conn => (
                            <tr key={conn.id} className="border-b border-slate-800/50">
                                <td className="p-4 font-medium">{conn.requester?.handle || 'Unknown'}</td>
                                <td className="p-4 font-medium">{conn.receiver?.handle || 'Unknown'}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${conn.status === 'accepted' ? 'bg-green-500/10 text-green-400' :
                                            conn.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                                                'bg-amber-500/10 text-amber-400'
                                        }`}>
                                        {conn.status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-slate-500">
                                    {new Date(conn.created_at).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
