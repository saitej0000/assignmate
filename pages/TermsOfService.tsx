import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../components/layout/Footer';
import { Shield, Clock, Scale } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';

export const TermsOfService: React.FC = () => {
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
                            <Shield size={32} />
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-6">Terms of Service</h1>
                        <div className="flex items-center justify-center gap-2 text-[#E6D5B8]/60">
                            <Clock size={16} />
                            <p className="text-sm uppercase tracking-widest font-bold">Last updated: January 2026</p>
                        </div>
                    </div>

                    {/* Content Card */}
                    <div className="bg-[#15100d] border border-white/5 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[100px] rounded-full pointer-events-none"></div>

                        <div className="relative z-10 prose prose-lg prose-invert max-w-none prose-headings:font-display prose-headings:text-white prose-p:text-[#E6D5B8]/70 prose-strong:text-white prose-li:text-[#E6D5B8]/70">
                            <p className="lead text-xl text-[#E6D5B8]/90 mb-12 font-light">
                                Welcome to AssignMate. These Terms of Service ("Terms") frame the rules for building a secure, fair, and collaborative learning network. By using our platform, you agree to these principles.
                            </p>

                            <h3 className="flex items-center gap-3 mt-12 mb-6 text-2xl">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#2c2219] border border-white/10 text-primary font-bold text-sm">1</span>
                                Acceptance of Terms
                            </h3>
                            <p>
                                By creating an account or accessing AssignMate, you confirm that you are a university student or educator and agree to comply with these terms. If you do not agree, you must stop using our services immediately.
                            </p>

                            <h3 className="flex items-center gap-3 mt-12 mb-6 text-2xl">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#2c2219] border border-white/10 text-primary font-bold text-sm">2</span>
                                Academic Integrity
                            </h3>
                            <p>
                                AssignMate is built for <strong>learning and collaboration</strong>, not cheating.
                            </p>
                            <ul>
                                <li>You agree NOT to use the platform to solicit others to complete assignments, exams, or graded work on your behalf ("contract cheating").</li>
                                <li>You will not provide services that violate the academic honesty policies of your institution or the recipient's institution.</li>
                                <li>We reserve the right to ban any user found soliciting or providing academic dishonesty services.</li>
                            </ul>

                            <h3 className="flex items-center gap-3 mt-12 mb-6 text-2xl">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#2c2219] border border-white/10 text-primary font-bold text-sm">3</span>
                                User Conduct & Safety
                            </h3>
                            <p>
                                To maintain a safe environment:
                            </p>
                            <ul>
                                <li><strong>Identity:</strong> You must use your real name and valid university credentials. Impersonation is prohibited.</li>
                                <li><strong>Respect:</strong> Harassment, hate speech, or bullying will result in an immediate ban.</li>
                                <li><strong>Payments:</strong> All financial transactions must be conducted through the AssignMate platform to ensure security and dispute resolution. Taking transactions off-platform is a violation of these terms.</li>
                            </ul>

                            <h3 className="flex items-center gap-3 mt-12 mb-6 text-2xl">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#2c2219] border border-white/10 text-primary font-bold text-sm">4</span>
                                Content & Copyright
                            </h3>
                            <p>
                                You retain ownership of content you post (notes, questions, guides), but grant AssignMate a license to display and distribute it on the platform. Do not upload copyrighted material (e.g., textbook PDFs) unless you have the right to do so.
                            </p>

                            <div className="mt-16 pt-8 border-t border-white/5">
                                <h4 className="flex items-center gap-2 mb-4 font-bold text-white">
                                    <Scale className="text-primary" size={20} />
                                    Contact for Legal Issues
                                </h4>
                                <p className="text-sm">
                                    If you have questions about these terms or wish to report a violation, please contact us at <a href="mailto:legal@assignmate.com" className="text-primary hover:text-orange-400 no-underline hover:underline transition-colors">legal@assignmate.com</a>.
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
