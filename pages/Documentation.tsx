import React from 'react';
import { GlassLayout } from '../components/layout/GlassLayout';
import { Book, Code, Zap, Shield, Users, MessageSquare } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

export const Documentation: React.FC = () => {
    const { section } = useParams();
    const navigate = useNavigate();

    const sections = [
        { id: 'getting-started', title: 'Getting Started', icon: <Zap size={20} />, content: 'Welcome to AssignMate! Learn how to set up your profile and start connecting with peers.' },
        { id: 'features', title: 'Key Features', icon: <Book size={20} />, content: 'Explore our community feed, direct messaging, and peer collaboration tools.' },
        { id: 'api', title: 'API Reference', icon: <Code size={20} />, content: 'Technical details for developers looking to integrate with AssignMate services.' },
        { id: 'security', title: 'Security & Safety', icon: <Shield size={20} />, content: 'How we protect your data and ensure a safe environment for all students.' },
    ];

    const activeSection = sections.find(s => s.id === section) || sections[0];

    return (
        <GlassLayout>
            <div className="max-w-7xl mx-auto py-20 px-6 sm:px-8">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar */}
                    <aside className="w-full lg:w-64 flex-shrink-0">
                        <nav className="sticky top-24 space-y-1">
                            {sections.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => navigate(`/docs/${s.id}`)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                                        activeSection.id === s.id
                                            ? 'bg-primary text-white shadow-lg'
                                            : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    {s.icon}
                                    {s.title}
                                </button>
                            ))}
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1 bg-white/50 backdrop-blur-xl border border-white/40 p-8 sm:p-12 rounded-[2.5rem] shadow-glass min-h-[600px]">
                        <h1 className="text-3xl font-extrabold text-slate-900 mb-6">{activeSection.title}</h1>
                        <div className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed">
                            <p>{activeSection.content}</p>
                            
                            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="size-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary mb-4">
                                        <Users size={24} />
                                    </div>
                                    <h3 className="font-bold text-slate-900 mb-2">Community Focused</h3>
                                    <p className="text-sm">Built specifically for students to collaborate on projects and share knowledge.</p>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="size-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary mb-4">
                                        <MessageSquare size={24} />
                                    </div>
                                    <h3 className="font-bold text-slate-900 mb-2">Real-time Chat</h3>
                                    <p className="text-sm">Instant communication with end-to-end encryption for your privacy.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GlassLayout>
    );
};
