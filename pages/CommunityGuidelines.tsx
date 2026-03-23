
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../components/layout/Footer';
import { Heart, Users, ShieldAlert, CheckCircle, ArrowLeft, MessageSquare } from 'lucide-react';

export const CommunityGuidelines: React.FC = () => {
    const navigate = useNavigate();

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-[#0d0b09] text-[#F5F5F4] font-body selection:bg-primary selection:text-white">
            {/* Simple Header */}
            <nav className="fixed w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 h-20 flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-8 h-8 rounded-lg overflow-hidden">
                            <img src="/logo.png" alt="AssignMate" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-display font-bold text-lg tracking-tight text-white">AssignMate</span>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-sm text-[#E6D5B8]/80 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Back to Home
                    </button>
                </div>
            </nav>

            <div className="pt-32 pb-20 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center justify-center size-16 bg-[#2c2219] border border-white/10 text-primary rounded-2xl mb-8 shadow-[0_0_20px_rgba(255,107,0,0.1)]">
                            <Users size={32} />
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-6">Community Guidelines</h1>
                        <p className="text-[#E6D5B8]/60 text-lg max-w-2xl mx-auto">
                            AssignMate is a community of students helping students. To keep this space safe, helpful, and respectful, we ask you to follow these simple rules.
                        </p>
                    </div>

                    {/* Content Card */}
                    <div className="bg-[#15100d] border border-white/5 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[100px] rounded-full pointer-events-none"></div>

                        <div className="relative z-10 space-y-16">

                            {/* Section 1: The Core Values */}
                            <section>
                                <h2 className="font-display text-2xl font-bold text-white mb-8 flex items-center gap-3">
                                    <Heart className="text-primary" />
                                    Our Core Values
                                </h2>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="bg-[#2c2219]/30 p-6 rounded-2xl border border-white/5">
                                        <h3 className="font-bold text-white mb-2">Respect Everyone</h3>
                                        <p className="text-[#E6D5B8]/70 text-sm">Treat others with kindness. Harassment, hate speech, and bullying are strictly prohibited.</p>
                                    </div>
                                    <div className="bg-[#2c2219]/30 p-6 rounded-2xl border border-white/5">
                                        <h3 className="font-bold text-white mb-2">Be Helpful</h3>
                                        <p className="text-[#E6D5B8]/70 text-sm">Contribute positively. Share knowledge, answer questions, and support your peers.</p>
                                    </div>
                                </div>
                            </section>

                            {/* Section 2: Prohibited Behavior */}
                            <section>
                                <h2 className="font-display text-2xl font-bold text-white mb-8 flex items-center gap-3">
                                    <ShieldAlert className="text-red-500" />
                                    What is Not Allowed
                                </h2>
                                <ul className="space-y-4">
                                    {[
                                        "Academic Dishonesty: Asking for or providing answers to exams, quizzes, or graded assignments.",
                                        "Spamming: Excessive self-promotion, repeated messages, or irrelevant content.",
                                        "Impersonation: Pretending to be someone else, including staff or other students.",
                                        "Illegal Content: Sharing pirated materials, illegal substances, or violent content."
                                    ].map((item, i) => (
                                        <li key={i} className="flex gap-4 items-start text-[#E6D5B8]/80 bg-[#0d0b09]/50 p-4 rounded-xl border border-white/5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2.5 flex-shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            {/* Section 3: Enforcement */}
                            <section>
                                <h2 className="font-display text-2xl font-bold text-white mb-8 flex items-center gap-3">
                                    <CheckCircle className="text-green-500" />
                                    Enforcement
                                </h2>
                                <p className="text-[#E6D5B8]/70 mb-6 leading-relaxed">
                                    We take these guidelines seriously. Violations may result in:
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {['Content Removal', 'Account Suspension', 'Permanent Ban'].map((action, i) => (
                                        <div key={i} className="text-center p-4 rounded-xl bg-[#2c2219]/20 border border-white/5 text-[#E6D5B8]/80 text-sm font-medium">
                                            {action}
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <div className="mt-16 pt-8 border-t border-white/5">
                                <h4 className="flex items-center gap-2 mb-4 font-bold text-white">
                                    <MessageSquare className="text-primary" size={20} />
                                    Reporting Violations
                                </h4>
                                <p className="text-sm text-[#E6D5B8]/70">
                                    If you see something that violates these guidelines, please report it using the "Report" feature on the post or profile, or contact us directly at <a href="mailto:safety@assignmate.com" className="text-primary hover:text-orange-400 no-underline hover:underline transition-colors">safety@assignmate.com</a>.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

