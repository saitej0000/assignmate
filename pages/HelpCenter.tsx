import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Mail, ExternalLink, HelpCircle, FileText, Shield, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from '../components/dashboard/Sidebar';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { MobileNav } from '../components/dashboard/MobileNav';

const faqs = [
    {
        category: "Getting Started",
        icon: FileText,
        color: "text-blue-500",
        bg: "bg-blue-50",
        items: [
            { q: "How do I create a profile?", a: "To create a profile, simply sign up using your email or Google account. Once registered, complete your onboarding steps by adding your university, major, and skills." },
            { q: "Is AssignMate free to use?", a: "Yes! AssignMate is free to join. You can connect with peers, join discussions, and access basic features at no cost." },
            { q: "How do I verify my student status?", a: "We use your university email address for verification. If you signed up with a personal email, you can link your .edu email in your profile settings to get the 'Verified Student' badge." }
        ]
    },
    {
        category: "Community & Connect",
        icon: User,
        color: "text-orange-500",
        bg: "bg-orange-50",
        items: [
            { q: "How do I connect with other students?", a: "You can find students by searching for their name, university, or major in the 'Find Peers' section. Click 'Connect' to send a request." },
            { q: "What is the difference between Global and Campus feed?", a: "The Campus feed shows posts only from students at your specific university, while the Global feed shows discussions from the entire AssignMate network." },
            { q: "Can I message someone without connecting?", a: "To ensure safety and reduce spam, you must be connected with a user before you can send them a direct message, unless they have 'Open DMs' enabled." }
        ]
    },
    {
        category: "Safety & Trust",
        icon: Shield,
        color: "text-green-500",
        bg: "bg-green-50",
        items: [
            { q: "How do I report a user or post?", a: "You can report any content by clicking the three dots menu on the post or profile and selecting 'Report'. Our team reviews these alerts 24/7." },
            { q: "Is my personal data safe?", a: "Absolutely. We encrypt all sensitive data and never sell your personal information to third parties. You have full control over your privacy settings." },
            { q: "What happens if I forget my password?", a: "You can reset your password from the login page by clicking 'Forgot Password'. We'll send a reset link to your registered email address." }
        ]
    }
];

export const HelpCenter = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [openIndex, setOpenIndex] = useState<string | null>(null);

    const togglefaq = (id: string) => {
        setOpenIndex(openIndex === id ? null : id);
    };

    const filteredFaqs = faqs.map(cat => ({
        ...cat,
        items: cat.items.filter(item =>
            item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.a.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(cat => cat.items.length > 0);

    return (
        <div className="bg-background text-text-dark antialiased h-screen overflow-hidden flex selection:bg-primary/20 font-display">
            <Sidebar user={user} />

            <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#F9FAFB]">
                <DashboardHeader />

                <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-4 pb-20">
                    <div className="max-w-4xl mx-auto space-y-8">

                        {/* Hero Section */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] p-8 md:p-12 text-white shadow-lg relative overflow-hidden text-center">
                            <div className="relative z-10 max-w-2xl mx-auto">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider mb-6 border border-white/20">
                                    <HelpCircle size={14} />
                                    Help Center
                                </div>
                                <h1 className="text-3xl md:text-5xl font-bold mb-6">
                                    How can we help you?
                                </h1>

                                <div className="relative max-w-lg mx-auto">
                                    <input
                                        type="text"
                                        placeholder="Search for answers..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full h-14 pl-12 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:bg-white/20 focus:border-white/40 focus:ring-0 outline-none backdrop-blur-md transition-all placeholder:text-white/60"
                                    />
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" size={20} />
                                </div>
                            </div>

                            {/* Decorative Circles */}
                            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-2xl -ml-10 -mb-10"></div>
                        </div>

                        {/* FAQs */}
                        <div className="grid gap-8">
                            {filteredFaqs.length > 0 ? (
                                filteredFaqs.map((cat, catIndex) => (
                                    <div key={catIndex} className="bg-white rounded-[1.5rem] border border-gray-100 p-6 md:p-8 shadow-sm">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className={`p-3 rounded-xl ${cat.bg} ${cat.color}`}>
                                                <cat.icon size={24} />
                                            </div>
                                            <h2 className="text-xl font-bold text-gray-900">{cat.category}</h2>
                                        </div>
                                        <div className="space-y-3">
                                            {cat.items.map((item, index) => {
                                                const id = `${catIndex}-${index}`;
                                                const isOpen = openIndex === id;
                                                return (
                                                    <div
                                                        key={index}
                                                        className={`rounded-xl border transition-all duration-200 overflow-hidden ${isOpen ? 'bg-gray-50 border-gray-200' : 'bg-white border-transparent hover:bg-gray-50'}`}
                                                    >
                                                        <button
                                                            onClick={() => togglefaq(id)}
                                                            className="w-full flex items-center justify-between p-4 text-left"
                                                        >
                                                            <span className={`font-semibold text-sm md:text-base ${isOpen ? 'text-gray-900' : 'text-gray-600'}`}>
                                                                {item.q}
                                                            </span>
                                                            {isOpen ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                                                        </button>
                                                        <div
                                                            className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}
                                                        >
                                                            <div className="p-4 pt-0 text-gray-500 text-sm leading-relaxed border-t border-gray-200/50 mt-1">
                                                                {item.a}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 opacity-50">
                                    <HelpCircle size={48} className="mx-auto mb-4 text-gray-300" />
                                    <p className="text-xl text-gray-400">No results found for "{searchQuery}"</p>
                                </div>
                            )}
                        </div>

                        {/* Contact Support */}
                        <section className="bg-white rounded-[1.5rem] border border-gray-100 p-8 shadow-sm text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Still need support?</h2>
                            <p className="text-gray-500 mb-8">Our team is available 24/7 to assist you with any issues.</p>
                            <div className="flex justify-center gap-4">
                                <button onClick={() => window.location.href = 'mailto:support@assignmate.com'} className="px-6 py-3 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
                                    <Mail size={20} />
                                    Contact Support
                                </button>
                                <button onClick={() => window.open('https://twitter.com/assignmate', '_blank')} className="px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl transition-all flex items-center gap-2">
                                    <ExternalLink size={20} />
                                    Message on X
                                </button>
                            </div>
                        </section>

                    </div>
                </div>
            </main>
            <MobileNav />
        </div>
    );
};
