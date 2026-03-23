import React from 'react';
import { GlassLayout } from '../components/layout/GlassLayout';
import { Presentation, Target, BarChart, Rocket } from 'lucide-react';

export const PitchDeck: React.FC = () => {
    return (
        <GlassLayout>
            <div className="max-w-6xl mx-auto py-20 px-6 sm:px-8">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center size-16 bg-primary/10 text-primary rounded-2xl mb-6">
                        <Presentation size={32} />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">AssignMate Pitch Deck</h1>
                    <p className="mt-4 text-slate-500 text-lg text-center max-w-2xl mx-auto">Connecting students for peer-to-peer collaboration and academic support.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white/50 backdrop-blur-xl border border-white/40 p-10 rounded-[2.5rem] shadow-glass">
                        <div className="size-12 bg-primary text-white rounded-2xl flex items-center justify-center mb-6">
                            <Target size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">The Problem</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Students often struggle to find reliable peers for collaboration, study groups, and project help within their own institutions or across the student community.
                        </p>
                    </div>

                    <div className="bg-white/50 backdrop-blur-xl border border-white/40 p-10 rounded-[2.5rem] shadow-glass">
                        <div className="size-12 bg-primary text-white rounded-2xl flex items-center justify-center mb-6">
                            <Rocket size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">The Solution</h2>
                        <p className="text-slate-600 leading-relaxed">
                            AssignMate provides a centralized, secure platform for students to connect, share knowledge, and collaborate on projects in real-time.
                        </p>
                    </div>

                    <div className="bg-white/50 backdrop-blur-xl border border-white/40 p-10 rounded-[2.5rem] shadow-glass md:col-span-2">
                        <div className="size-12 bg-primary text-white rounded-2xl flex items-center justify-center mb-6">
                            <BarChart size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Market Opportunity</h2>
                        <p className="text-slate-600 leading-relaxed">
                            With millions of students transitioning to hybrid and remote learning, the need for effective peer-to-peer networking tools has never been greater. AssignMate targets this growing niche with a student-first approach.
                        </p>
                    </div>
                </div>
            </div>
        </GlassLayout>
    );
};
