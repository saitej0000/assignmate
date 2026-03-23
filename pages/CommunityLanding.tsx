import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Heart, Zap, Globe, MessageSquare, ArrowRight } from 'lucide-react';

export const CommunityLanding = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0d0b09] text-[#F5F5F4] font-body selection:bg-primary selection:text-white pt-20">
            {/* Hero */}
            <section className="relative py-24 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0b09] via-[#0d0b09]/90 to-transparent"></div>

                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <span className="text-primary font-bold tracking-widest uppercase text-sm mb-4 block">The AssignMate Network</span>
                    <h1 className="font-display text-5xl md:text-7xl font-bold mb-8 leading-tight">
                        More Than Just<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-200">Classmates.</span>
                    </h1>
                    <p className="text-[#E6D5B8]/80 text-xl font-light leading-relaxed max-w-2xl mx-auto mb-10">
                        We are a movement of students helping students. We believe that knowledge grows when shared, and no one should have to struggle alone.
                    </p>
                    <button onClick={() => navigate('/auth?tab=signup')} className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors flex items-center gap-2 mx-auto">
                        Join the Movement <ArrowRight size={20} />
                    </button>
                </div>
            </section>

            {/* Values */}
            <section className="py-20 px-4 bg-[#15100d]">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="text-center md:text-left">
                            <h2 className="font-display text-3xl font-bold mb-6">Our Values</h2>
                            <p className="text-[#E6D5B8]/60">The principles that guide every interaction on our platform.</p>
                        </div>
                        {[
                            {
                                icon: Heart,
                                title: "Empathy First",
                                desc: "We understand the pressure of academics. Kindness and patience are our default settings."
                            },
                            {
                                icon: Zap,
                                title: "Active Collaboration",
                                desc: "Don't just copy. Understand. Explain. Discuss. True learning happens in the exchange."
                            },
                            {
                                icon: Globe,
                                title: "Inclusive Growth",
                                desc: "From IITs to local colleges, talent is everywhere. We bridge the gap between institutions."
                            }
                        ].map((val, i) => (
                            <div key={i} className="bg-[#2c2219]/30 p-8 rounded-3xl border border-white/5 backdrop-blur-sm">
                                <val.icon size={32} className="text-primary mb-4" />
                                <h3 className="font-bold text-xl text-white mb-2">{val.title}</h3>
                                <p className="text-[#E6D5B8]/70 text-sm leading-relaxed">{val.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats / Proof */}
            <section className="py-24 border-y border-white/5">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        { label: 'Active Students', value: '10,000+' },
                        { label: 'Campuses', value: '50+' },
                        { label: 'Queries Solved', value: '25k+' },
                        { label: 'Avg Response Time', value: '2 hrs' },
                    ].map((stat, i) => (
                        <div key={i}>
                            <div className="font-display text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                            <div className="text-[#E6D5B8]/50 text-sm uppercase tracking-wider font-bold">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-32 px-4 text-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="relative z-10 max-w-3xl mx-auto">
                    <MessageSquare size={48} className="mx-auto text-primary mb-6" />
                    <h2 className="font-display text-4xl md:text-5xl font-bold mb-8">Ready to find your people?</h2>
                    <p className="text-[#E6D5B8]/70 text-lg mb-12">
                        Whether you need help with Calculus or want to find a hackathon team, your community is here.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button onClick={() => navigate('/feed')} className="px-8 py-3 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl transition-colors">
                            Launch Dashboard
                        </button>
                        <button onClick={() => navigate('/community-guidelines')} className="px-8 py-3 bg-transparent border border-white/20 hover:bg-white/5 text-white font-bold rounded-xl transition-colors">
                            Read Guidelines
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};
