import React from 'react';
import { GlassLayout } from '../components/layout/GlassLayout';
import { Gamepad2, Users, Cpu, Globe } from 'lucide-react';

export const GDC: React.FC = () => {
    return (
        <GlassLayout>
            <div className="max-w-6xl mx-auto py-20 px-6 sm:px-8">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center size-16 bg-primary/10 text-primary rounded-2xl mb-6">
                        <Gamepad2 size={32} />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">GDC Presentation</h1>
                    <p className="mt-4 text-slate-500 text-lg">Game Development & Collaboration in AssignMate</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white/50 backdrop-blur-xl border border-white/40 p-10 rounded-[2.5rem] shadow-glass">
                        <div className="size-12 bg-primary text-white rounded-2xl flex items-center justify-center mb-6">
                            <Cpu size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Tech Integration</h2>
                        <p className="text-slate-600 leading-relaxed">
                            How we leverage real-time technologies to facilitate seamless collaboration between game developers, artists, and sound designers on the platform.
                        </p>
                    </div>

                    <div className="bg-white/50 backdrop-blur-xl border border-white/40 p-10 rounded-[2.5rem] shadow-glass">
                        <div className="size-12 bg-primary text-white rounded-2xl flex items-center justify-center mb-6">
                            <Users size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Community Groups</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Dedicated spaces for game dev clubs and student organizations to manage their projects and recruit new members.
                        </p>
                    </div>

                    <div className="bg-white/50 backdrop-blur-xl border border-white/40 p-10 rounded-[2.5rem] shadow-glass md:col-span-2">
                        <div className="size-12 bg-primary text-white rounded-2xl flex items-center justify-center mb-6">
                            <Globe size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Global Reach</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Connecting student game developers across borders, fostering a diverse and inclusive environment for creative innovation.
                        </p>
                    </div>
                </div>
            </div>
        </GlassLayout>
    );
};
