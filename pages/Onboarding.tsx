import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { CollegeAutocomplete } from '../components/CollegeAutocomplete';
import { Sparkles, ArrowRight, Mail, Send, CheckCircle2, BookOpen, Users, Globe } from 'lucide-react';
import { isProfileComplete } from '../utils/profileValidation';
import { AIProfileBuilder } from '../components/onboarding/AIProfileBuilder';

export const Onboarding = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, refreshProfile, resendVerification } = useAuth();
    const { error, success } = useToast();

    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [form, setForm] = useState({ fullName: '', handle: '', school: '', bio: '' });

    // Internal state for UI selection, maps to isWriter for backend
    const [selectedGoal, setSelectedGoal] = useState('learn'); // 'learn', 'collaborate', 'community'
    const [isWriter, setIsWriter] = useState(false);

    const [showAI, setShowAI] = useState(true);
    const [aiData, setAiData] = useState<any>(null); // Store AI JSON

    // Initialize form with user's existing data or passed state
    useEffect(() => {
        if (user) {
            const locState = location.state || {}; // Get passed data from Auth

            // Prefer: 1. Passed State -> 2. User Profile (Filtered)
            // Filter out defaults like 'Student' or 'user_...'
            const safeFullName = (user.full_name === 'Student' ? '' : user.full_name);
            const safeHandle = (user.handle?.startsWith('user_') && user.handle.length > 8 ? '' : user.handle); // Only filter clear defaults

            setForm(prev => ({
                ...prev,
                fullName: prev.fullName || locState.fullName || safeFullName || '',
                handle: prev.handle || locState.handle || safeHandle || '',
                school: prev.school || locState.school || user.school || '',
                bio: prev.bio || locState.bio || user.bio || ''
            }));
        }
    }, [user, location.state]);

    // Update isWriter based on goal selection
    useEffect(() => {
        // "Collaborate" implies active contribution/writer role in original schema
        setIsWriter(selectedGoal === 'collaborate');
    }, [selectedGoal]);

    // Redirect if user is already complete or not logged in
    useEffect(() => {
        if (!user) {
            navigate('/auth');
        } else if (isProfileComplete(user) && user.emailVerified) {
            navigate('/feed');
        }
    }, [user, navigate]);

    const handleCheckVerification = async () => {
        setVerifying(true);
        try {
            await refreshProfile();
            success("Profile status updated.");
        } catch (e) {
            console.error("Verification check failed", e);
            error("Could not verify status using latest data.");
        } finally {
            setVerifying(false);
        }
    };

    const handleResendEmail = async () => {
        try {
            if (resendVerification) {
                await resendVerification();
                success("Verification email sent! Check your inbox.");
            }
        } catch (e: any) {
            error("Failed to send email: " + e.message);
        }
    };

    const handleAIComplete = (data: any, bio: string) => {
        setAiData(data);
        setForm(prev => ({ ...prev, bio }));
        setShowAI(false);
        success("Profile generated from AI!");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { dbService } = await import('../services/firestoreService');

            // 1. Update Profile
            await dbService.updateProfile(user!.id, {
                full_name: form.fullName,
                handle: form.handle,
                school: form.school,
                bio: form.bio,
                is_writer: isWriter,
                ai_profile: aiData || null, // Save structured AI data if available
                is_incomplete: false // Mark as complete
            });

            // 2. Refresh Context
            await refreshProfile();

            // 3. Navigate
            success("Welcome to the community!");
            navigate('/feed');
        } catch (e: any) {
            console.error(e);
            error("Failed to save profile: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    // 🛑 EMAIL VERIFICATION GATE
    if (user.email && !user.emailVerified) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0d0b09] p-6 font-display overflow-hidden relative">
                {/* Background Blobs */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[100px]"></div>
                </div>

                <div className="w-full max-w-md relative z-10">
                    <div className="p-8 md:p-10 text-center border border-white/10 shadow-xl bg-[#2c2219] rounded-3xl">
                        <div className="size-20 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-6 shadow-inner border border-orange-500/20">
                            <Mail className="text-orange-500" size={32} />
                        </div>

                        <h1 className="text-2xl font-bold text-white mb-3">Verify Your Email</h1>
                        <p className="text-[#E6D5B8]/80 mb-8 leading-relaxed">
                            We've sent a link to <span className="font-bold text-white">{user.email}</span>. <br />
                            Please verify to continue.
                        </p>

                        <div className="space-y-4">
                            <button
                                onClick={handleCheckVerification}
                                disabled={verifying}
                                className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                {verifying ? (
                                    <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <CheckCircle2 size={20} />
                                )}
                                I've Verified It
                            </button>

                            <button
                                onClick={handleResendEmail}
                                className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-[#E6D5B8] font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                <Send size={18} />
                                Resend Email
                            </button>
                        </div>

                        <p className="mt-8 text-xs text-[#E6D5B8]/40">
                            Check your spam folder just in case.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (showAI) {
        return (
            <div className="h-screen w-full bg-[#0d0b09] flex items-center justify-center p-4 md:p-8">
                <div className="w-full max-w-4xl h-[85vh] relative z-10">
                    <AIProfileBuilder onComplete={handleAIComplete} onSkip={() => setShowAI(false)} />
                </div>
                {/* Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-[120px]"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0d0b09] p-4 font-display relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3 opacity-30"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3 opacity-30"></div>
            </div>

            <div className="w-full max-w-[500px] relative z-10">
                {/* BROWN THEME CARD - NO SCROLL COMPACT LAYOUT */}
                <div className="p-6 md:p-8 shadow-2xl border border-white/10 backdrop-blur-xl bg-[#2c2219] rounded-3xl text-left">
                    <div className="text-center mb-6">
                        <div className="mx-auto mb-3 size-12 bg-gradient-to-tr from-primary to-orange-400 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 rotate-3 transform hover:rotate-6 transition-transform">
                            <span className="material-symbols-outlined text-white text-2xl">school</span>
                        </div>
                        <h1 className="text-2xl font-black text-white mb-1 tracking-tight">Welcome to AssignMate</h1>
                        <p className="text-[#E6D5B8]/60 font-medium text-xs">Let's personalize your learning experience.</p>
                    </div>

                    <div className="relative">
                        {!aiData && (
                            <button
                                type="button"
                                onClick={() => setShowAI(true)}
                                className="w-full mb-5 group relative overflow-hidden p-[2px] rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient-x"></div>
                                <div className="relative bg-[#221910] rounded-xl p-3 flex items-center justify-center gap-3">
                                    <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                                        <Sparkles className="text-indigo-400" size={16} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                                            Build your learning profile with AI
                                        </p>
                                    </div>
                                    <ArrowRight className="ml-auto text-indigo-400 group-hover:translate-x-1 transition-transform" size={16} />
                                </div>
                            </button>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-[#E6D5B8]/40 uppercase tracking-wider mb-1 ml-1">Full Name</label>
                                    <div className="relative group">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg group-focus-within:text-primary transition-colors">person</span>
                                        <input
                                            type="text"
                                            placeholder="John Doe"
                                            value={form.fullName}
                                            onChange={e => setForm({ ...form, fullName: e.target.value })}
                                            required
                                            className="w-full h-10 pl-10 pr-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-white/20 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all text-xs font-medium"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-[#E6D5B8]/40 uppercase tracking-wider mb-1 ml-1">Handle</label>
                                    <div className="relative group">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg group-focus-within:text-primary transition-colors">alternate_email</span>
                                        <input
                                            type="text"
                                            placeholder="username"
                                            value={form.handle}
                                            onChange={e => {
                                                const val = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
                                                setForm({ ...form, handle: val });
                                            }}
                                            required
                                            className="w-full h-10 pl-10 pr-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-white/20 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all text-xs font-medium"
                                        />
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-bold text-[#E6D5B8]/40 uppercase tracking-wider mb-1 ml-1">University</label>
                                    <div className="relative">
                                        <CollegeAutocomplete
                                            value={form.school}
                                            onChange={(val) => setForm({ ...form, school: val })}
                                            placeholder="Search your college..."
                                            className="w-full"
                                            inputClassName="w-full h-10 pl-10 pr-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-white/20 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all text-xs font-medium"
                                            icon={<span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-500 text-lg">school</span>}
                                        />
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <div className="flex justify-between items-center mb-1 ml-1">
                                        <label className="block text-[10px] font-bold text-[#E6D5B8]/40 uppercase tracking-wider">Bio</label>
                                        {aiData && <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">✨ AI Generated</span>}
                                    </div>
                                    <div className="relative group">
                                        <span className="material-symbols-outlined absolute left-3 top-3 text-gray-500 text-lg group-focus-within:text-primary transition-colors">edit_note</span>
                                        <textarea
                                            className={`w - full h - 16 pl - 10 pr - 3 py - 2.5 rounded - xl border bg - black / 20 focus: bg - black / 30 text - xs font - medium text - white placeholder - white / 20 transition - all outline - none resize - none ${aiData
                                                    ? 'border-indigo-500/30 ring-1 ring-indigo-500/20'
                                                    : 'border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/50'
                                                } `}
                                            placeholder="Interests & collaboration style..."
                                            value={form.bio}
                                            onChange={e => setForm({ ...form, bio: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-1">
                                <label className="block text-[10px] font-bold text-[#E6D5B8]/40 uppercase tracking-wider mb-2 ml-1">Participation Style</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {/* Option 1: Learn */}
                                    <button
                                        type="button"
                                        onClick={() => setSelectedGoal('learn')}
                                        className={`relative p - 2 rounded - xl border transition - all duration - 300 flex flex - col items - center gap - 1.5 ${selectedGoal === 'learn'
                                                ? 'bg-primary/20 border-primary shadow-lg shadow-orange-500/10 scale-[1.02]'
                                                : 'bg-black/20 border-white/5 hover:bg-black/40 hover:border-white/10'
                                            } `}
                                    >
                                        {selectedGoal === 'learn' && (
                                            <div className="absolute top-1.5 right-1.5 text-primary">
                                                <CheckCircle2 size={10} fill="currentColor" className="text-white" />
                                            </div>
                                        )}
                                        <div className={`p - 1.5 rounded - full ${selectedGoal === 'learn' ? 'bg-primary/20 text-primary' : 'bg-white/5 text-gray-500'} `}>
                                            <BookOpen size={14} />
                                        </div>
                                        <span className={`text - [10px] font - bold text - center leading - tight ${selectedGoal === 'learn' ? 'text-primary' : 'text-gray-400'} `}>
                                            Learn & Discuss
                                        </span>
                                    </button>

                                    {/* Option 2: Collaborate */}
                                    <button
                                        type="button"
                                        onClick={() => setSelectedGoal('collaborate')}
                                        className={`relative p - 2 rounded - xl border transition - all duration - 300 flex flex - col items - center gap - 1.5 ${selectedGoal === 'collaborate'
                                                ? 'bg-[#E6D5B8]/20 border-[#E6D5B8] shadow-lg shadow-[#E6D5B8]/10 scale-[1.02]'
                                                : 'bg-black/20 border-white/5 hover:bg-black/40 hover:border-white/10'
                                            } `}
                                    >
                                        {selectedGoal === 'collaborate' && (
                                            <div className="absolute top-1.5 right-1.5 text-[#E6D5B8]">
                                                <CheckCircle2 size={10} fill="currentColor" className="text-black" />
                                            </div>
                                        )}
                                        <div className={`p - 1.5 rounded - full ${selectedGoal === 'collaborate' ? 'bg-[#E6D5B8] text-black' : 'bg-white/5 text-gray-500'} `}>
                                            <Users size={14} />
                                        </div>
                                        <span className={`text - [10px] font - bold text - center leading - tight ${selectedGoal === 'collaborate' ? 'text-[#E6D5B8]' : 'text-gray-400'} `}>
                                            Project Collab
                                        </span>
                                    </button>

                                    {/* Option 3: Communities */}
                                    <button
                                        type="button"
                                        onClick={() => setSelectedGoal('community')}
                                        className={`relative p - 2 rounded - xl border transition - all duration - 300 flex flex - col items - center gap - 1.5 ${selectedGoal === 'community'
                                                ? 'bg-blue-500/20 border-blue-500 shadow-lg shadow-blue-500/10 scale-[1.02]'
                                                : 'bg-black/20 border-white/5 hover:bg-black/40 hover:border-white/10'
                                            } `}
                                    >
                                        {selectedGoal === 'community' && (
                                            <div className="absolute top-1.5 right-1.5 text-blue-500">
                                                <CheckCircle2 size={10} fill="currentColor" className="text-white" />
                                            </div>
                                        )}
                                        <div className={`p - 1.5 rounded - full ${selectedGoal === 'community' ? 'bg-blue-500/20 text-blue-500' : 'bg-white/5 text-gray-500'} `}>
                                            <Globe size={14} />
                                        </div>
                                        <span className={`text - [10px] font - bold text - center leading - tight ${selectedGoal === 'community' ? 'text-blue-400' : 'text-gray-400'} `}>
                                            Join Communities
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 mt-2 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
                            >
                                {loading ? <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Complete Profile'}
                                {!loading && <ArrowRight size={18} />}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
