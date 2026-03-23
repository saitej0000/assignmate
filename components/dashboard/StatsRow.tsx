import React from 'react';

export const StatsRow: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Active Projects Card */}
            <div className="bg-white p-6 rounded-[1.75rem] border border-border-subtle shadow-card flex flex-col justify-between h-40 group hover:border-primary/40 transition-all relative overflow-hidden">
                <div className="flex justify-between items-start z-10">
                    <div>
                        <p className="text-text-muted text-sm font-medium mb-1">Active Projects</p>
                        <h3 className="text-4xl font-extrabold text-text-dark">2</h3>
                    </div>
                    <div className="bg-primary-light p-2.5 rounded-full text-primary ring-1 ring-primary/10">
                        <span className="material-symbols-outlined">assignment</span>
                    </div>
                </div>
                <div className="z-10 flex items-center gap-2">
                    <div className="flex -space-x-2 overflow-hidden">
                        <img alt="" className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKxSFzpM-BgB2qQ1d85Uu51_OIe2WxmiD88HEAUegg7VuQUXqF2zJx5ayTcLg8LFpSt1VZzymsCvpWe6iXRU9caNqM6Y0OK4NigsTiD1C5Lyjtouws27TbM1Uy3R6p0qwSxPX2Ef5aQVoTpNuK6WPS2bB9_rsDbpBhUbpscoJ-vM3yhvifw9uPCcfShnGKCzBCfIdwaS1nFMLyur_omvbWyWlcnB3I0o1dxFBLv1szAxoyLkp-STrKzut7yTDVP9pdv4NDQ2XmLN4e" />
                        <div className="h-6 w-6 rounded-full bg-gray-100 ring-2 ring-white flex items-center justify-center text-[10px] font-bold text-gray-500">+1</div>
                    </div>
                    <span className="text-xs font-semibold text-text-muted">In Progress</span>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-transparent"></div>
            </div>

            {/* Escrow Balance Card */}
            <div className="bg-white p-6 rounded-[1.75rem] border border-border-subtle shadow-card flex flex-col justify-between h-40 group hover:border-emerald-200 transition-all">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-text-muted text-sm font-medium mb-1">Escrow Balance</p>
                        <h3 className="text-4xl font-extrabold text-text-dark">₹1,500</h3>
                    </div>
                    <div className="bg-emerald-50 p-2.5 rounded-full text-emerald-600 ring-1 ring-emerald-100">
                        <span className="material-symbols-outlined">account_balance</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">Funds Secured</span>
                </div>
            </div>

            {/* Next Deadline Card */}
            <div className="bg-white p-6 rounded-[1.75rem] border border-red-100 shadow-card flex flex-col justify-between h-40 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <span className="material-symbols-outlined text-8xl">timer</span>
                </div>
                <div className="flex justify-between items-start z-10">
                    <div>
                        <p className="text-text-muted text-sm font-medium mb-1">Next Deadline</p>
                        <div className="flex items-baseline gap-1">
                            <h3 className="text-4xl font-extrabold text-text-dark">2</h3>
                            <span className="text-lg font-bold text-text-muted">Days</span>
                        </div>
                    </div>
                    <div className="bg-red-50 p-2.5 rounded-full text-red-500 ring-1 ring-red-100 animate-pulse">
                        <span className="material-symbols-outlined">priority_high</span>
                    </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-auto z-10">
                    <div className="bg-red-500 h-1.5 rounded-full w-[75%]"></div>
                </div>
                <p className="text-xs text-red-600 font-bold mt-2 z-10">Macroeconomics 101 Case Study</p>
            </div>
        </div>
    );
};
