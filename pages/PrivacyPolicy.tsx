import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../components/layout/Footer';
import { Lock, ShieldCheck, Server, Mail, ArrowLeft } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
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
                            <Lock size={32} />
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-6">Privacy Policy</h1>
                        <div className="flex items-center justify-center gap-2 text-[#E6D5B8]/60">
                            <ShieldCheck size={16} />
                            <p className="text-sm uppercase tracking-widest font-bold">Last updated: January 2026</p>
                        </div>
                    </div>

                    {/* Content Card */}
                    <div className="bg-[#15100d] border border-white/5 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[100px] rounded-full pointer-events-none"></div>

                        <div className="relative z-10 prose prose-lg prose-invert max-w-none prose-headings:font-display prose-headings:text-white prose-p:text-[#E6D5B8]/70 prose-strong:text-white prose-li:text-[#E6D5B8]/70">
                            <p className="lead text-xl text-[#E6D5B8]/90 mb-12 font-light">
                                Your privacy is paramount. AssignMate is designed to protect your identity while enabling transparent collaboration. This policy outlines how we handle your data.
                            </p>

                            <h3 className="flex items-center gap-3 mt-12 mb-6 text-2xl">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#2c2219] border border-white/10 text-primary font-bold text-sm">1</span>
                                Information We Collect
                            </h3>
                            <p>To provide our services, we collect:</p>
                            <ul>
                                <li><strong>Identity Data:</strong> Name, university email (.edu), and profile picture (via Google Auth or upload).</li>
                                <li><strong>Academic Verification:</strong> Student ID cards or transcripts used for verification (encrypted and stored strictly for verification purposes).</li>
                                <li><strong>Usage Data:</strong> Chats, posts, and interaction history on the platform.</li>
                            </ul>

                            <h3 className="flex items-center gap-3 mt-12 mb-6 text-2xl">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#2c2219] border border-white/10 text-primary font-bold text-sm">2</span>
                                How We Use Your Data
                            </h3>
                            <p>We use your data strictly to:</p>
                            <ul>
                                <li>Verify your student status (Campus Verified badge).</li>
                                <li>Match you with relevant peers and mentors.</li>
                                <li>Process secure payments and escrow.</li>
                                <li>Maintain platform safety and prevent fraud.</li>
                            </ul>

                            <h3 className="flex items-center gap-3 mt-12 mb-6 text-2xl">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#2c2219] border border-white/10 text-primary font-bold text-sm">3</span>
                                Data Protection & Sharing
                            </h3>
                            <p>
                                <strong>We do not sell your personal data.</strong> We share data only with:
                            </p>
                            <ul>
                                <li><strong>Service Providers:</strong> Cloud hosting (Firebase), payment processors (Razorpay/Stripe).</li>
                                <li><strong>Legal Obligations:</strong> Compliance with law enforcement if required.</li>
                            </ul>
                            <div className="my-8 p-6 bg-[#2c2219]/50 rounded-2xl border border-primary/20 flex gap-4 items-start">
                                <Server className="flex-shrink-0 w-6 h-6 text-primary mt-1" />
                                <p className="text-sm m-0 text-[#E6D5B8]">
                                    Your data is encrypted in transit (TLS) and at rest. Verification documents are isolated with restricted access permissions.
                                </p>
                            </div>

                            <h3 className="flex items-center gap-3 mt-12 mb-6 text-2xl">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#2c2219] border border-white/10 text-primary font-bold text-sm">4</span>
                                Your Rights
                            </h3>
                            <p>
                                You have the right to access, correct, or delete your personal data. You can export your data or request account deletion directly from your Profile settings.
                            </p>

                            <div className="mt-16 pt-8 border-t border-white/5">
                                <h4 className="flex items-center gap-2 mb-4 font-bold text-white">
                                    <Mail className="text-primary" size={20} />
                                    Privacy Contact
                                </h4>
                                <p className="text-sm">
                                    For data requests or privacy concerns, contact our Data Protection Officer at <a href="mailto:privacy@assignmate.com" className="text-primary hover:text-orange-400 no-underline hover:underline transition-colors">privacy@assignmate.com</a>.
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
