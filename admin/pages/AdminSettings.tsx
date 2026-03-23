import React, { useState } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Save, Bell, Shield, Lock } from 'lucide-react';

export const AdminSettings = () => {
    const [settings, setSettings] = useState({
        allowSignups: true,
        maintenanceMode: false,
        maxDailyConnections: 10,
        chatThrottle: 1000,
    });

    const handleChange = (key: string, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        alert('Settings saved (mock)');
    };

    return (
        <div className="max-w-3xl space-y-8">
            <h2 className="text-2xl font-bold text-white">System Settings</h2>

            <GlassCard className="p-6 border border-slate-800 bg-slate-900/50 space-y-6">
                <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                    <div>
                        <h3 className="text-lg font-medium text-white">General Configuration</h3>
                        <p className="text-sm text-slate-400">Control global system behavior</p>
                    </div>
                    <button onClick={handleSave} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                        <Save size={18} /> Save Changes
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-950 rounded-lg border border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/10 text-green-500 rounded"><Shield size={20} /></div>
                            <div>
                                <div className="font-medium text-white">Allow New Registrations</div>
                                <div className="text-xs text-slate-500">Enable or disable new user signups</div>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={settings.allowSignups} onChange={e => handleChange('allowSignups', e.target.checked)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-950 rounded-lg border border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-500/10 text-amber-500 rounded"><Lock size={20} /></div>
                            <div>
                                <div className="font-medium text-white">Maintenance Mode</div>
                                <div className="text-xs text-slate-500">Lock the site for all non-admin users</div>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={settings.maintenanceMode} onChange={e => handleChange('maintenanceMode', e.target.checked)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Max Daily Connections</label>
                        <input
                            type="number"
                            value={settings.maxDailyConnections}
                            onChange={e => handleChange('maxDailyConnections', parseInt(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-red-500 focus:outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Chat Throttle (ms)</label>
                        <input
                            type="number"
                            value={settings.chatThrottle}
                            onChange={e => handleChange('chatThrottle', parseInt(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-red-500 focus:outline-none"
                        />
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};
