import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { CollegeAutocomplete } from '../components/CollegeAutocomplete';
import { GlassButton } from '../components/ui/GlassButton';
import { GraduationCap, Search, PenTool, ArrowRight } from 'lucide-react';
import { isProfileComplete } from '../utils/profileValidation';

export const Auth = ({ onComplete }: { onComplete?: () => void }) => {
    const navigate = useNavigate();
    const { user, login, register, loginWithGoogle, completeGoogleSignup, resetPassword } = useAuth();
    const { error, success, info } = useToast();

    // Form states
    const [searchParams] = useSearchParams();
    const [isReg, setIsReg] = useState(searchParams.get('tab') === 'signup');
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ email: '', password: '', fullName: '', handle: '', school: '', bio: '' });
    const [isWriter, setIsWriter] = useState(false);

    // Google completion form
    const [completionForm, setCompletionForm] = useState({ handle: '', school: '' });
    const [completionIsWriter, setCompletionIsWriter] = useState(false);

    const submittedFormRef = React.useRef<any>(null);

    // ✅ FIX: Use unified isProfileComplete helper - single source of truth
    useEffect(() => {
        if (user) {
            if (!isProfileComplete(user)) {
                // Profile incomplete - redirect to onboarding
                // Pass submitted form data if available to pre-fill onboarding
                navigate('/onboarding', { state: submittedFormRef.current || {} });
            } else {
                // Profile complete - proceed to feed or call onComplete
                if (onComplete) {
                    onComplete();
                } else {
                    const redirect = searchParams.get('redirect');
                    const q = searchParams.get('q');
                    if (redirect) {
                        const target = q ? `${redirect}?q=${encodeURIComponent(q)}` : redirect;
                        navigate(target);
                    } else {
                        navigate('/feed');
                    }
                }
            }
        }
    }, [user, onComplete, navigate, searchParams]);

    // Handle email/password registration and login
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Store form data for potential onboarding redirect
        submittedFormRef.current = form;

        try {
            // Validation
            if (isReg) {
                // ✅ ISSUE 8 FIX: Add fullName validation
                if (!form.fullName || form.fullName.trim().length < 2) {
                    error("Full name must be at least 2 characters.");
                    setLoading(false);
                    return;
                }
                if (!form.handle || form.handle.length < 3) {
                    error("Handle must be at least 3 characters.");
                    setLoading(false);
                    return;
                }
                if (!form.school) {
                    error("Please select your college/university.");
                    setLoading(false);
                    return;
                }
                if (form.password.length < 6) {
                    error("Password must be at least 6 characters.");
                    setLoading(false);
                    return;
                }
            } else {
                if (form.password.length < 6) {
                    error("Password must be at least 6 characters.");
                    setLoading(false);
                    return;
                }
            }

            let result;
            if (isReg) {
                result = await register(form.email, form.password, form.fullName, form.handle, form.school, isWriter, form.bio);
            } else {
                result = await login(form.email, form.password);
            }

            if (result?.error) {
                const errMsg = result.error.message || "Authentication failed";
                let userMsg = errMsg;

                if (errMsg.includes('email-already-in-use')) {
                    userMsg = "This email is already registered. Please login.";
                } else if (errMsg.includes('wrong-password') || errMsg.includes('user-not-found') || errMsg.includes('invalid-credential')) {
                    userMsg = "Invalid email or password.";
                } else if (errMsg.includes('weak-password')) {
                    userMsg = "Password is too weak. Please use a stronger password.";
                }

                error(userMsg);
                setLoading(false);
            } else if (result?.data?.session || result?.data?.user) {
                success(isReg ? "Account created successfully!" : "Welcome back!");
                // Navigation handled by useEffect when user state updates
            }
        } catch (err: any) {
            console.error("Auth error:", err);
            error(err.message || "An unexpected error occurred.");
            setLoading(false);
        }
        // Remove finally block to keep loading true on success until redirect happens
    };

    // Handle Google login
    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const result = await loginWithGoogle();
            if (result.error) {
                error(result.error.message || "Google login failed.");
            }
            // onAuthStateChange will handle the rest
        } catch (err: any) {
            console.error("Google login error:", err);
            error(err.message || "Google login failed.");
        } finally {
            setLoading(false);
        }
    };

    // Handle profile completion for Google users
    const handleCompleteProfile = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!completionForm.school) {
            error("Please select your college.");
            return;
        }
        if (!completionForm.handle || completionForm.handle.length < 3) {
            error("Handle must be at least 3 characters.");
            return;
        }

        setLoading(true);
        try {
            await completeGoogleSignup(completionForm.handle, completionForm.school, completionIsWriter);
            success("Profile setup complete! Welcome.");
            if (onComplete) {
                setTimeout(() => onComplete(), 500);
            }
        } catch (err: any) {
            console.error("Profile completion error:", err);
            error(err.message || "Failed to complete profile setup.");
        } finally {
            setLoading(false);
        }
    };

    // Handle password reset
    const handleForgotPassword = async () => {
        if (!form.email) {
            error("Please enter your email address first.");
            return;
        }
        try {
            await resetPassword(form.email);
            info("Password reset email sent. Check your inbox.");
        } catch (err: any) {
            error(err.message || "Failed to send reset email.");
        }
    };

    // Profile completion logic removed as it is now handled automatically in AuthContext

    return (
        <div className="min-h-screen flex flex-col lg:flex-row font-display text-[#1b140d] dark:text-white transition-colors duration-200">
            {/* Left Side (Desktop) */}
            <div className="relative hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between p-12 overflow-hidden bg-[#221910]">
                <div className="absolute inset-0 z-0">
                    <img
                        alt="Students Studying"
                        className="w-full h-full object-cover opacity-40"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDM9ktUci-Kb5mEw_DOMEpJLr53J2wfANvRdkNqHaWwlo8jSp34PvO0-68ihzJG9YpzciRCxG0JAXYD1_pbv7rc5-N7SEKnIXYEmtO65-p9QTxkACIM5xzHVsPRs2UrA9mplTI73p5gUhUzGX7Zp_giSmCOI4OUcHlilXnpj08p839N-jDrrkhfajFVwNomaA1UH08CkQPGEP21fG7q_UqfqI_0hLMzyi_awkz50ZPxTnrbeFL82BJNxLhkcLMIIGa3xdOWlo1Nt_-N"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#221910] via-[#221910]/80 to-transparent"></div>
                </div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/20 rounded-full blur-[100px] z-0"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-500/20 rounded-full blur-[100px] z-0"></div>

                <div className="relative z-10 flex items-center gap-2">
                    <div className="size-10 rounded-xl overflow-hidden">
                        <img src="/logo.png" alt="AssignMate Logo" className="w-full h-full object-cover" />
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight">AssignMate</h2>
                </div>

                <div className="relative z-10 my-auto max-w-lg">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 mb-6 backdrop-blur-sm">
                        <span className="material-symbols-outlined text-primary text-sm">security</span>
                        <span className="text-xs font-bold text-primary tracking-wide uppercase">Campus Verified</span>
                    </div>
                    <h1 className="text-4xl xl:text-5xl font-black leading-tight mb-6 text-white">
                        Learn, Connect, and <span className="text-primary">Grow Together</span>.
                    </h1>
                    <p className="text-gray-300 text-lg mb-10 leading-relaxed">
                        Connect with verified students from your campus to discuss subjects, collaborate on projects, and learn together.
                    </p>

                    <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-2xl transform rotate-1 hover:rotate-0 transition-all duration-500 cursor-default">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex gap-1 text-primary">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <span key={i} className="material-symbols-outlined text-sm fill-current" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                ))}
                            </div>
                            <span className="material-symbols-outlined text-white/20 text-2xl">format_quote</span>
                        </div>
                        <p className="text-sm font-medium text-gray-200 leading-relaxed mb-4">"Trusted by students across multiple campuses to find peers and collaborate securely."</p>
                        <div className="flex items-center gap-3">
                            <img alt="Student" className="w-10 h-10 rounded-full border-2 border-primary/50" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJY7INpqcQQsp-lWIu_rci1_QHqrnpb0EAo-biaiC6wl7kwVrHi2tXL_SgRPHg3B6QlVAZZoHglXZskrcdpi-4n0Wm7YynjXmZeHxKcAzdh9QhdLZDKtKGCFBQ_8jhcoZp6hIGw-BNWHmAWYFBhwdLJZWAcY9VNbEsSDoZcF0aT3Gy3KBUkqodRXB9gYJIcLKPrhwPmgHdZ3Xo_ZGylB9o72htjvtUMgJYyCJBru4khkMPJ4xswsqbk07QogKRO4RAWmdaPtl7TJNG" />
                            <div>
                                <p className="text-sm font-bold text-white">Ananya S.</p>
                                <p className="text-xs text-gray-400">Delhi University</p>
                            </div>
                            <div className="ml-auto">
                                <span className="material-symbols-outlined text-blue-400 text-xl fill-current" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex justify-between items-center text-xs text-gray-500 font-medium tracking-wide uppercase">
                    <span>© 2026 AssignMate</span>
                    <span>Community-Driven & Verified</span>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full lg:w-7/12 xl:w-1/2 bg-background-light dark:bg-[#1a120b] flex flex-col relative overflow-y-auto">
                {/* Mobile Header */}
                <div className="lg:hidden flex items-center justify-between p-6">
                    <div className="flex items-center gap-2">
                        <div className="size-8 rounded-lg overflow-hidden">
                            <img src="/logo.png" alt="AssignMate Logo" className="w-full h-full object-cover" />
                        </div>
                        <h2 className="text-lg font-bold text-[#1b140d] dark:text-white">AssignMate</h2>
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-20">
                    <div className="w-full max-w-[420px] mx-auto">
                        {/* Toggle Tabs */}
                        <div className="bg-gray-200/50 dark:bg-white/5 p-1.5 rounded-2xl flex mb-10 relative">
                            <div
                                className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white dark:bg-[#2c2219] rounded-xl shadow-sm transition-all z-0 ${isReg ? 'left-[calc(50%+3px)]' : 'left-1.5'}`}
                            ></div>
                            <button
                                onClick={() => setIsReg(false)}
                                className={`flex-1 relative z-10 py-3 text-sm font-bold transition-colors text-center ${!isReg ? 'text-[#1b140d] dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-[#1b140d] dark:hover:text-white'}`}
                            >
                                Log In
                            </button>
                            <button
                                onClick={() => setIsReg(true)}
                                className={`flex-1 relative z-10 py-3 text-sm font-bold transition-colors text-center ${isReg ? 'text-[#1b140d] dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-[#1b140d] dark:hover:text-white'}`}
                            >
                                Sign Up
                            </button>
                        </div>

                        <div className="mb-8 text-center md:text-left">
                            <h2 className="text-3xl font-black text-[#1b140d] dark:text-white mb-3">
                                {isReg ? 'Create Account' : 'Welcome back'}
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400">
                                {isReg ? 'Join the community of ambitious students.' : 'Enter your credentials to access your secure dashboard.'}
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 mb-8">
                            <button
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                className="w-full h-14 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 flex items-center justify-center gap-3 font-bold text-[#1b140d] dark:text-white transition-all group disabled:opacity-50"
                            >
                                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                {loading ? 'Processing...' : 'Sign in with Google'}
                            </button>
                        </div>

                        <div className="relative flex py-2 items-center mb-8">
                            <div className="flex-grow border-t border-gray-200 dark:border-white/10"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase font-bold tracking-wider">Or continue with email</span>
                            <div className="flex-grow border-t border-gray-200 dark:border-white/10"></div>
                        </div>

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {isReg && (
                                <>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">Full Name</label>
                                        <div className="relative group">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">person</span>
                                            <input
                                                className="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm font-medium text-[#1b140d] dark:text-white placeholder-gray-400 transition-all outline-none"
                                                placeholder="John Doe"
                                                type="text"
                                                value={form.fullName}
                                                onChange={e => setForm({ ...form, fullName: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">Choose a Handle</label>
                                        <div className="relative group">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">alternate_email</span>
                                            <input
                                                className="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm font-medium text-[#1b140d] dark:text-white placeholder-gray-400 transition-all outline-none"
                                                placeholder="username"
                                                type="text"
                                                value={form.handle}
                                                onChange={e => {
                                                    const val = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
                                                    setForm({ ...form, handle: val });
                                                }}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 relative z-50">
                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">University</label>
                                        <CollegeAutocomplete
                                            value={form.school}
                                            onChange={(val) => setForm({ ...form, school: val })}
                                            placeholder="Select your college"
                                            className="w-full"
                                            inputClassName="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm font-medium text-[#1b140d] dark:text-white placeholder-gray-400 transition-all outline-none"
                                            icon={<span className="material-symbols-outlined absolute left-4 top-3.5 text-gray-400">school</span>}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">Bio (Optional)</label>
                                        <div className="relative group">
                                            <span className="material-symbols-outlined absolute left-4 top-4 text-gray-400 group-focus-within:text-primary transition-colors">edit_note</span>
                                            <textarea
                                                className="w-full h-24 pl-12 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm font-medium text-[#1b140d] dark:text-white placeholder-gray-400 transition-all outline-none resize-none"
                                                placeholder="Tell us about your interests or what you enjoy learning..."
                                                value={form.bio}
                                                onChange={e => setForm({ ...form, bio: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">Email Address</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">mail</span>
                                    <input
                                        className="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm font-medium text-[#1b140d] dark:text-white placeholder-gray-400 transition-all outline-none"
                                        placeholder="student@university.edu"
                                        type="email"
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Password</label>
                                    {!isReg && (
                                        <button type="button" onClick={handleForgotPassword} className="text-xs font-bold text-primary hover:text-primary/80 transition-colors">
                                            Forgot Password?
                                        </button>
                                    )}
                                </div>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">lock</span>
                                    <input
                                        className="w-full h-14 pl-12 pr-12 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm font-medium text-[#1b140d] dark:text-white placeholder-gray-400 transition-all outline-none"
                                        placeholder="••••••••"
                                        type="password"
                                        value={form.password}
                                        onChange={e => setForm({ ...form, password: e.target.value })}
                                        required
                                    />
                                    <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none" type="button">
                                        <span className="material-symbols-outlined text-[20px]">visibility_off</span>
                                    </button>
                                </div>
                            </div>

                            {isReg && (
                                <div className="space-y-2 pt-2">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-wide">
                                        What is your goal?
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div
                                            onClick={() => setIsWriter(false)}
                                            className={`cursor-pointer rounded-xl border p-4 flex flex-col items-center justify-center text-center transition-all duration-200 ${!isWriter
                                                ? 'bg-orange-50 border-orange-500 ring-2 ring-orange-500/20'
                                                : 'bg-white border-slate-200 hover:bg-slate-50'
                                                }`}
                                        >
                                            <Search className={!isWriter ? 'text-orange-500' : 'text-slate-400'} size={24} />
                                            <span className={`text-xs font-bold mt-2 ${!isWriter ? 'text-orange-600' : 'text-slate-500'}`}>
                                                Learn & Collaborate
                                            </span>
                                        </div>
                                        <div
                                            onClick={() => setIsWriter(true)}
                                            className={`cursor-pointer rounded-xl border p-4 flex flex-col items-center justify-center text-center transition-all duration-200 ${isWriter
                                                ? 'bg-orange-50 border-orange-500 ring-2 ring-orange-500/20'
                                                : 'bg-white border-slate-200 hover:bg-slate-50'
                                                }`}
                                        >
                                            <GraduationCap className={isWriter ? 'text-orange-500' : 'text-slate-400'} size={24} />
                                            <span className={`text-xs font-bold mt-2 ${isWriter ? 'text-orange-600' : 'text-slate-500'}`}>
                                                Contribute & Connect
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-14 bg-primary hover:bg-primary/90 text-[#1b140d] text-base font-bold rounded-2xl shadow-xl shadow-primary/20 hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                                >
                                    {loading ? 'Processing...' : (isReg ? 'Create Account' : 'Log In')} <span className="material-symbols-outlined text-lg font-bold">arrow_forward</span>
                                </button>
                            </div>
                        </form>

                        <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                            Protected by <span className="font-bold flex items-center justify-center gap-1 inline-flex align-middle text-gray-600 dark:text-gray-300"><span className="material-symbols-outlined text-sm">verified_user</span> reCAPTCHA</span>
                        </p>

                        <div className="mt-4 flex justify-center gap-6 text-xs text-gray-400 font-medium">
                            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-primary transition-colors">Help</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

