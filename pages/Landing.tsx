import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { collegeService, College } from '../services/collegeService';

// --- Components ---

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-white/5 py-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between text-left group"
            >
                <span className={`text-sm sm:text-base font-semibold transition-colors ${isOpen ? 'text-primary' : 'text-white/80'}`}>
                    {question}
                </span>
                <span className={`material-symbols-outlined transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : 'text-white/20'}`}>
                    expand_more
                </span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 mt-3' : 'max-h-0'}`}>
                <p className="text-sm text-[#E6D5B8]/40 leading-relaxed pb-2">
                    {answer}
                </p>
            </div>
        </div>
    );
};

export const Landing = () => {
    const navigate = useNavigate();

    // ── State ──────────────────────────────────────────────
    const [notifyEmail, setNotifyEmail] = useState('');
    const [notifyCollege, setNotifyCollege] = useState('');
    const [suggestions, setSuggestions] = useState<College[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    const [emailSubmitted, setEmailSubmitted] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [referralLink, setReferralLink] = useState('');

    // SEO and Title
    useEffect(() => {
        document.title = "AssignMate | Join the #1 Campus Student Network";
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute("content", "India's first ID-verified, hyper-local student collaboration platform. Join the waitlist for early access.");
        }
    }, []);

    // ── College Search Effect ─────────────────────────────
    useEffect(() => {
        if (!notifyCollege || notifyCollege.length < 2) {
            setSuggestions([]);
            return;
        }
        const timer = setTimeout(async () => {
            const results = await collegeService.search(notifyCollege);
            setSuggestions(results);
        }, 300);
        return () => clearTimeout(timer);
    }, [notifyCollege]);

    // Click outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ── Countdown Timer – April 1, 2026 ───────────────────
    useEffect(() => {
        const launchDate = new Date('2026-05-20T00:00:00').getTime();
        const tick = () => {
            const now = Date.now();
            const diff = Math.max(0, launchDate - now);
            setCountdown({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((diff / (1000 * 60)) % 60),
                seconds: Math.floor((diff / 1000) % 60),
            });
        };
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, []);

    // ── Referral Link Generator ───────────────────────────
    const generateRefLink = (email: string) => {
        const hash = btoa(email.split('@')[0] + Math.random().toString(36).substring(7));
        return `${window.location.origin}?ref=${hash.substring(0, 8)}`;
    };

    // ── Email Submit → Firestore ──────────────────────────
    const handleNotifySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const email = notifyEmail.trim().toLowerCase();
        const college = notifyCollege.trim();
        if (!email || !college) return;

        setSubmitting(true);
        setEmailError('');

        try {
            await addDoc(collection(db, 'waitlist'), {
                email,
                college,
                subscribed_at: serverTimestamp(),
                source: 'landing_page',
            });

            // Fire the welcome email
            fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, college }),
            }).catch(console.error);

            const link = generateRefLink(email);
            setReferralLink(link);
            setEmailSubmitted(true);
            setNotifyEmail('');
            setNotifyCollege('');
            // success state persists until manually closed or timed out longer
        } catch (err: any) {
            console.error('Waitlist signup error:', err);
            setEmailError('Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleShare = (platform: 'whatsapp' | 'twitter') => {
        const text = `Hey! I just joined India's first verified student network, AssignMate. Join the waitlist with my link to get early access and premium perks! 🚀 ${referralLink}`;
        const urls = {
            whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
        };
        window.open(urls[platform], '_blank');
    };

    // ── Render ─────────────────────────────────────────────
    const isDevMode = localStorage.getItem('dev_mode') === 'true';

    return (
        <div className="min-h-screen w-full font-body antialiased bg-[#0a0908] text-[#F5F5F4] selection:bg-primary selection:text-white overflow-x-hidden relative">

            {/* ── Ambient Background Blobs ── */}
            <div className="pointer-events-none fixed inset-0 z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[700px] h-[700px] bg-primary/[0.06] blur-[180px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-orange-900/[0.08] blur-[150px] rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-primary/[0.02] blur-[200px] rounded-full" />
            </div>

            {/* ── Minimal Navbar ── */}
            <nav className="relative z-20 w-full">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(255,107,0,0.15)]">
                            <img src="/logo.png" alt="AssignMate" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-display font-bold text-xl tracking-tight text-white">AssignMate</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="hidden sm:flex items-center gap-6 text-sm text-[#E6D5B8]/50">
                            <a href="/safety" className="hover:text-primary transition-colors">Safety</a>
                            <a href="/community-about" className="hover:text-primary transition-colors">About</a>
                        </div>
                        <div className="flex items-center gap-4 border-l border-white/10 pl-6 ml-2">
                            <a href="https://instagram.com/assignmate" target="_blank" className="text-white/30 hover:text-primary transition-colors">
                                <i className="fab fa-instagram text-lg"></i>
                            </a>
                            <div className="w-[1px] h-4 bg-white/10" />
                            <a href="https://discord.gg/assignmate" target="_blank" className="text-white/30 hover:text-primary transition-colors">
                                <i className="fab fa-discord text-lg"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section className="relative z-10 pt-10 sm:pt-16 lg:pt-20 pb-6">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-[0.15em] mb-10 animate-pulse">
                        <span className="material-symbols-outlined text-sm">rocket_launch</span>
                        Launching May 20, 2026
                    </div>

                    <h1 className="font-display text-5xl sm:text-6xl lg:text-8xl font-extrabold tracking-tight text-white leading-[1.05] mb-6">
                        The Future of{' '}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-orange-400 to-amber-300">
                            Campus Learning
                        </span>
                    </h1>

                    <p className="text-base sm:text-lg lg:text-xl text-[#E6D5B8]/60 max-w-2xl mx-auto font-light leading-relaxed mb-10">
                        India's first ID-verified, hyper-local student collaboration platform.
                        Connect with campus peers, share knowledge, and grow together.
                    </p>

                    {/* Social Proof Counter */}
                    <div className="flex flex-col items-center gap-4 mb-16">
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4, 5].map(i => (
                                <img key={i} src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="user" className="w-8 h-8 rounded-full border-2 border-[#0a0908] bg-white/5" />
                            ))}
                            <div className="w-8 h-8 rounded-full border-2 border-[#0a0908] bg-primary flex items-center justify-center text-[10px] font-bold text-white">+2.4k</div>
                        </div>
                        <p className="text-xs font-semibold text-[#E6D5B8]/30">
                            Join <span className="text-primary">2,450+ students</span> from <span className="text-white/60">50+ top Indian colleges</span>
                        </p>
                    </div>
                </div>
            </section>

            {/* ── Countdown Timer ── */}
            <section className="relative z-10 pb-16">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#E6D5B8]/30 mb-8">Countdown to Launch</p>
                    <div className="flex justify-center gap-3 sm:gap-5 mb-6">
                        {[
                            { value: countdown.days, label: 'Days' },
                            { value: countdown.hours, label: 'Hours' },
                            { value: countdown.minutes, label: 'Min' },
                            { value: countdown.seconds, label: 'Sec' },
                        ].map((unit) => (
                            <div key={unit.label} className="flex flex-col items-center">
                                <div className="w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] rounded-2xl bg-[#161310] border border-white/[0.06] flex items-center justify-center mb-2 relative overflow-hidden group hover:border-primary/20 transition-all duration-300 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6)]">
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="font-display text-3xl sm:text-4xl font-bold text-white relative z-10 tabular-nums">
                                        {String(unit.value).padStart(2, '0')}
                                    </span>
                                </div>
                                <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.15em] text-[#E6D5B8]/30">{unit.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Get Notified First ── */}
            <section id="waitlist" className="relative z-10 pb-24">
                <div className="max-w-xl mx-auto px-4 text-center">
                    <div className="bg-[#141110] rounded-3xl border border-white/[0.06] p-8 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden">
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/[0.06] rounded-full blur-[60px]" />
                        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-orange-900/[0.08] rounded-full blur-[60px]" />

                        <div className="relative z-10">
                            {emailSubmitted ? (
                                <div className="animate-in fade-in zoom-in duration-500">
                                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                                        <span className="material-symbols-outlined text-emerald-400 text-3xl">verified</span>
                                    </div>
                                    <h3 className="font-display text-2xl font-bold text-white mb-2">You're on the list!</h3>
                                    <p className="text-sm text-[#E6D5B8]/50 mb-8">We've saved your spot. Share your unique link below to move up the priority list!</p>

                                    <div className="bg-[#0a0908] rounded-xl border border-white/5 p-4 mb-6 relative group">
                                        <div className="text-[10px] text-white/20 absolute -top-2 left-3 bg-[#141110] px-2 font-bold uppercase tracking-wider">Your Referral Link</div>
                                        <div className="flex items-center justify-between gap-3 overflow-hidden">
                                            <span className="text-xs text-primary truncate font-mono">{referralLink}</span>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(referralLink);
                                                    alert('Linked copied!');
                                                }}
                                                className="text-white/40 hover:text-white transition-colors flex-shrink-0"
                                            >
                                                <span className="material-symbols-outlined text-lg">content_copy</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleShare('whatsapp')}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition-all transform hover:-translate-y-1"
                                        >
                                            <i className="fab fa-whatsapp"></i> Share on WhatsApp
                                        </button>
                                        <button
                                            onClick={() => handleShare('twitter')}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1DA1F2] hover:bg-[#1DA1F2]/80 text-white rounded-xl font-bold text-xs transition-all transform hover:-translate-y-1"
                                        >
                                            <i className="fab fa-x-twitter"></i> Share on X
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => setEmailSubmitted(false)}
                                        className="text-[10px] text-[#E6D5B8]/20 mt-8 font-bold uppercase tracking-widest hover:text-white/40 transition-colors"
                                    >
                                        Register Another Email
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
                                        <span className="material-symbols-outlined text-primary text-2xl">notifications_active</span>
                                    </div>

                                    <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-2">Get Notified First</h3>
                                    <p className="text-sm text-[#E6D5B8]/50 mb-8">Be among the first to experience AssignMate when we launch.</p>

                                    <form onSubmit={handleNotifySubmit} className="flex flex-col gap-3">
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <input
                                                type="email"
                                                required
                                                placeholder="your@email.com"
                                                value={notifyEmail}
                                                onChange={(e) => setNotifyEmail(e.target.value)}
                                                disabled={submitting}
                                                className="flex-1 px-5 py-3.5 bg-[#0a0908] border border-white/[0.08] rounded-xl text-white placeholder-[#E6D5B8]/25 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all text-sm disabled:opacity-50"
                                            />
                                            <div className="flex-1 relative" ref={searchRef}>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Your full college name"
                                                    value={notifyCollege}
                                                    onChange={(e) => {
                                                        setNotifyCollege(e.target.value);
                                                        setShowSuggestions(true);
                                                    }}
                                                    onFocus={() => {
                                                        if (notifyCollege.length >= 2) setShowSuggestions(true);
                                                    }}
                                                    disabled={submitting}
                                                    className="w-full px-5 py-3.5 bg-[#0a0908] border border-white/[0.08] rounded-xl text-white placeholder-[#E6D5B8]/25 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all text-sm disabled:opacity-50"
                                                />
                                                {showSuggestions && suggestions.length > 0 && (
                                                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#121212] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 max-h-60 overflow-y-auto">
                                                        {suggestions.map((college, idx) => (
                                                            <button
                                                                type="button"
                                                                key={idx}
                                                                className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                                                                onClick={() => {
                                                                    setNotifyCollege(college.name);
                                                                    setShowSuggestions(false);
                                                                }}
                                                            >
                                                                <div className="font-semibold text-sm text-[#E6D5B8]">{college.name}</div>
                                                                <div className="text-xs text-[#E6D5B8]/50 mt-0.5">
                                                                    {college.state} {college.type ? `• ${college.type}` : ''}
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full px-7 py-3.5 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl shadow-[0_0_30px_rgba(255,107,0,0.2)] hover:shadow-[0_0_50px_rgba(255,107,0,0.35)] transition-all transform hover:-translate-y-0.5 whitespace-nowrap text-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                                        >
                                            {submitting ? (
                                                <>
                                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                                                    Saving...
                                                </>
                                            ) : 'Join the Waitlist'}
                                        </button>
                                    </form>
                                    {emailError && (
                                        <p className="text-red-400 text-xs mt-3">{emailError}</p>
                                    )}
                                    <p className="text-[10px] text-[#E6D5B8]/25 mt-5">No spam — just a single notification on launch day.</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Feature Teasers ── */}
            <section className="relative z-10 pb-24">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[#E6D5B8]/30 mb-12">What to Expect</p>
                    <div className="grid sm:grid-cols-3 gap-5">
                        {[
                            {
                                icon: 'verified_user',
                                title: 'Campus Verified',
                                desc: 'Every student is ID-verified with their college credentials. No fake profiles — just real peers.',
                            },
                            {
                                icon: 'hub',
                                title: 'Smart Matching',
                                desc: 'Find seniors and peers from your exact university who know your curriculum inside out.',
                            },
                            {
                                icon: 'shield',
                                title: 'Secure & Free',
                                desc: '100% free for students. End-to-end encrypted chats with built-in trust & safety systems.',
                            },
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="group p-7 sm:p-8 rounded-2xl bg-[#141110] border border-white/[0.05] hover:border-primary/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,0,0.06)] relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/[0.03] rounded-full blur-2xl -mr-8 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300">
                                    <span className="material-symbols-outlined text-xl text-primary">{feature.icon}</span>
                                </div>
                                <h4 className="font-display text-base font-bold text-white mb-2">{feature.title}</h4>
                                <p className="text-sm text-[#E6D5B8]/45 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Early Access Perks ── */}
            <section className="relative z-10 pb-24">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-r from-[#161310] to-[#0e0c0a] rounded-[40px] border border-white/[0.04] p-10 sm:p-16 relative overflow-hidden text-center sm:text-left">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/[0.03] blur-[100px] -mr-40 -mt-40" />
                        <div className="flex flex-col sm:flex-row items-center gap-12 relative z-10">
                            <div className="flex-1">
                                <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-6">Early Access Perks</h2>
                                <p className="text-[#E6D5B8]/50 text-sm sm:text-base leading-relaxed mb-8">
                                    Joining early isn't just about the spot — it's about the privileges. Get exclusive rewards that won't be available after the public launch.
                                </p>
                                <ul className="space-y-5">
                                    {[
                                        { title: 'Exclusive Founder Badge', desc: 'A permanent flair on your profile showing you were here first.' },
                                        { title: 'AssignMate Plus (6 Months)', desc: 'Full access to all premium matching and analytics tools for free.' },
                                        { title: 'Beta Community Access', desc: 'Direct access to the core team to help shape the future of AssignMate.' }
                                    ].map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-4">
                                            <div className="mt-1 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                                <span className="material-symbols-outlined text-primary text-[10px] font-bold">check</span>
                                            </div>
                                            <div>
                                                <h5 className="text-sm font-bold text-white">{item.title}</h5>
                                                <p className="text-xs text-[#E6D5B8]/30">{item.desc}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="w-full sm:w-1/3 aspect-square rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center p-8 relative overflow-hidden group">
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/5 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                <div className="relative text-center">
                                    <span className="material-symbols-outlined text-primary text-[64px] mb-4 animate-bounce">workspace_premium</span>
                                    <div className="text-xs font-bold uppercase tracking-widest text-[#E6D5B8]/40">Exclusive for the</div>
                                    <div className="text-xl font-display font-black text-white">First 5,000 Signups</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Founder's Note ── */}
            <section className="relative z-10 pb-24 border-b border-white/5">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/20 mx-auto mb-8 shadow-[0_0_40px_rgba(255,107,0,0.1)]">
                        <img src="https://i.pravatar.cc/150?u=founder" alt="Founder" className="w-full h-full object-cover" />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-white mb-4">"Building for the Indian Campus"</h3>
                    <p className="text-base text-[#E6D5B8]/50 italic font-light leading-relaxed mb-8 max-w-2xl mx-auto">
                        "AssignMate started from a simple frustration: why is it so hard to find reliable peers on campus? We're building this for every student who has ever felt lost in a crowded lecture hall or struggled with a project alone."
                    </p>
                    <div className="text-sm">
                        <span className="font-bold text-white">Junaid Pasha</span>
                        <span className="text-primary/40 mx-2">•</span>
                        <span className="text-[#E6D5B8]/30">Founder, AssignMate</span>
                    </div>
                </div>
            </section>

            {/* ── FAQ Section ── */}
            <section className="relative z-10 py-24">
                <div className="max-w-3xl mx-auto px-4">
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-white text-center mb-12">Common Questions</h2>
                    <div className="bg-[#141110]/50 border border-white/[0.03] rounded-3xl p-6 sm:p-10">
                        <FAQItem
                            question="Is AssignMate really free for students?"
                            answer="Yes, the core collaboration and networking features will always be 100% free for verified students across India."
                        />
                        <FAQItem
                            question="How do you verify if someone is actually a student?"
                            answer="We use a multi-step verification process including .edu emails, college ID verification, and geo-fenced campus check-ins."
                        />
                        <FAQItem
                            question="What happens when someone shares a referral link?"
                            answer="Referring friends helps you move up the priority list for the private beta launch and unlocks exclusive early-adopter badges."
                        />
                        <FAQItem
                            question="Is my data safe and private?"
                            answer="Absolutely. We use end-to-end encryption for chats and we never sell your personal student data to third parties."
                        />
                    </div>
                </div>
            </section>

            {/* ── Bottom CTA ── */}
            <section className="relative z-10 pb-16">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <div className="py-12 px-6 rounded-3xl bg-gradient-to-b from-[#161310] to-[#0e0c0a] border border-white/[0.04] relative overflow-hidden">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                        <p className="text-[#E6D5B8]/40 text-sm font-light mb-3">Trusted by students across</p>
                        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-semibold text-[#E6D5B8]/60">
                            <span>IITs</span>
                            <span className="text-primary/40">•</span>
                            <span>NITs</span>
                            <span className="text-primary/40">•</span>
                            <span>Delhi University</span>
                            <span className="text-primary/40">•</span>
                            <span>BITS</span>
                            <span className="text-primary/40">•</span>
                            <span>NLUs</span>
                            <span className="text-primary/40">•</span>
                            <span>500+ colleges</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Developer Bypass Button ── */}
            {isDevMode && (
                <div className="fixed bottom-6 right-6 z-50">
                    <button
                        onClick={() => navigate('/auth')}
                        className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-bold rounded-xl shadow-[0_4px_20px_rgba(124,58,237,0.3)] hover:shadow-[0_4px_25px_rgba(124,58,237,0.5)] transition-all hover:-translate-y-1 transform border border-white/10"
                    >
                        <span className="material-symbols-outlined text-lg">code</span>
                        Developer Mode: Enter App
                    </button>
                </div>
            )}

            {/* ── Minimal Footer ── */}
            <footer className="relative z-10 border-t border-white/[0.04] py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-8 sm:gap-4">
                    <div className="flex flex-col items-center sm:items-start gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md overflow-hidden">
                                <img src="/logo.png" alt="AssignMate" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-xs text-[#E6D5B8]/30 font-bold tracking-wider">ASSIGNMATE</span>
                        </div>
                        <p className="text-[10px] text-[#E6D5B8]/20 max-w-xs text-center sm:text-left leading-relaxed">
                            © 2026 AssignMate Private Limited. Built with ❤️ for students in India.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:flex items-start gap-12 text-xs text-[#E6D5B8]/30">
                        <div className="flex flex-col gap-3">
                            <h6 className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Legal</h6>
                            <a href="/terms" className="hover:text-primary transition-colors">Terms</a>
                            <a href="/privacy" className="hover:text-primary transition-colors">Privacy</a>
                            <a href="/community-guidelines" className="hover:text-primary transition-colors">Guidelines</a>
                        </div>
                        <div className="flex flex-col gap-3">
                            <h6 className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Connect</h6>
                            <a href="https://instagram.com/assignmate" className="hover:text-primary transition-colors">Instagram</a>
                            <a href="https://twitter.com/assignmate" className="hover:text-primary transition-colors">Twitter (X)</a>
                            <a href="https://discord.gg/assignmate" className="hover:text-primary transition-colors">Discord</a>
                        </div>
                        <div className="flex flex-col gap-3">
                            <h6 className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Support</h6>
                            <a href="mailto:support@assignmate.com" className="hover:text-primary transition-colors flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">mail</span>
                                Contact
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};
