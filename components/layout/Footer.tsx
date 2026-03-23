import React from 'react';

export const Footer = () => {
    return (
        <footer className="bg-[#2c2219] border-t border-white/5 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
                    <div className="col-span-2 lg:col-span-2">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg">
                                <img src="/logo.png" alt="AssignMate" className="w-full h-full object-cover" />
                            </div>
                            <span className="font-bold text-2xl tracking-tight text-white">AssignMate</span>
                        </div>
                        <p className="text-[#E6D5B8]/60 text-sm leading-relaxed mb-8 max-w-sm">
                            India's first hyper-local student learning network. Connect with verified peers for collaborative academic growth.
                        </p>
                        <div className="flex gap-4">
                            <a className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-[#E6D5B8] hover:bg-primary hover:text-white transition-all border border-white/5" href="#">
                                <span className="material-symbols-outlined text-lg">public</span>
                            </a>
                            <a className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-[#E6D5B8] hover:bg-primary hover:text-white transition-all border border-white/5" href="#">
                                <span className="material-symbols-outlined text-lg">chat</span>
                            </a>
                        </div>
                    </div>
                    {[
                        {
                            title: 'Platform', links: [
                                { label: 'How it works', href: '/#how-it-works' },
                                { label: 'Browse Peers', href: '/feed' },
                                { label: 'Safety & Trust', href: '/safety' },
                                { label: 'Community', href: '/community-about' }
                            ]
                        },
                        {
                            title: 'Support', links: [
                                { label: 'Help Center', href: '/docs' },
                                { label: 'Contact Us', href: 'mailto:support@assignmate.com' },
                                { label: 'Dispute Resolution', href: '/safety' }
                            ]
                        },
                        {
                            title: 'Legal', links: [
                                { label: 'Terms of Service', href: '/terms' },
                                { label: 'Privacy Policy', href: '/privacy' },
                                { label: 'Community Guidelines', href: '/community-guidelines' },
                                { label: 'Academic Integrity', href: '/community-guidelines' }
                            ]
                        },
                    ].map((col, i) => (
                        <div key={i}>
                            <h4 className="text-primary font-bold text-xs uppercase tracking-widest mb-8">{col.title}</h4>
                            <ul className="space-y-4 text-sm text-[#E6D5B8]/60">
                                {col.links.map(link => (
                                    <li key={link.label}><a className="hover:text-primary transition-colors" href={link.href}>{link.label}</a></li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#E6D5B8]/30">
                    <p>© 2026 AssignMate Private Limited. All rights reserved.</p>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">language</span>
                        <span>English (India)</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};
