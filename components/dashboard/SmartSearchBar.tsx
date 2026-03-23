import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, UserCheck, GraduationCap, MapPin, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dbService } from '../../services/firestoreService';
import { collegeService, College } from '../../services/collegeService';
import { User } from '../../types';
import { Avatar } from '../ui/Avatar';

interface SmartSearchBarProps {
    className?: string;
    placeholder?: string;
    showPopular?: boolean;
}

export const SmartSearchBar: React.FC<SmartSearchBarProps> = ({
    className = "",
    placeholder = "Search for peers, colleges...",
    showPopular = false
}) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [loading, setLoading] = useState(false);

    // Data State
    const [allUsers, setAllUsers] = useState<User[]>([]);

    // Autocomplete Results
    const [acUserResults, setAcUserResults] = useState<User[]>([]);
    const [acCollegeResults, setAcCollegeResults] = useState<College[]>([]);

    const wrapperRef = useRef<HTMLDivElement>(null);

    // Initial Fetch (Lazy loaded on focus or mount to save resources?)
    // For responsiveness, let's fetch on mount like Peers page, but optimized
    useEffect(() => {
        let mounted = true;
        const fetchData = async () => {
            try {
                // We only need to fetch users once
                if (allUsers.length > 0) return;

                const users = await dbService.getAllUsers() as User[];
                if (mounted) {
                    // Filter out current user
                    setAllUsers(users.filter(u => u.id !== user?.id));
                }
            } catch (err) {
                console.error("Search bar data fetch error:", err);
            }
        };

        fetchData();
        return () => { mounted = false; };
    }, [user?.id]);

    // Search Logic
    useEffect(() => {
        if (!query.trim() || query.length < 2) {
            setAcUserResults([]);
            setAcCollegeResults([]);
            return;
        }

        const q = query.toLowerCase();

        // 1. Search Users
        const users = allUsers.filter(u =>
            (u.handle?.toLowerCase().includes(q)) ||
            (u.full_name?.toLowerCase().includes(q))
        ).slice(0, 5);
        setAcUserResults(users);

        // 2. Search Colleges
        let active = true;
        collegeService.getAll().then(colleges => {
            if (!active) return;
            const matches = colleges.filter(c =>
                c.name.toLowerCase().includes(q) ||
                c.state.toLowerCase().includes(q)
            ).slice(0, 5);
            setAcCollegeResults(matches);
        });

        return () => { active = false; };
    }, [query, allUsers]);

    // Click Outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectUser = (userId: string) => {
        navigate(`/profile/${userId}`);
        setIsFocused(false);
        setQuery('');
    };

    const handleSelectCollege = (collegeName: string) => {
        // Navigate to Peers page with college filter
        // Assuming Peers page handles 'q' param
        navigate(`/peers?q=${encodeURIComponent(collegeName)}`);
        setIsFocused(false);
        setQuery('');
    };

    const handleSearch = () => {
        if (query.trim()) {
            navigate(`/peers?q=${encodeURIComponent(query)}`);
            setIsFocused(false);
            setQuery('');
        }
    };

    return (
        <div className={`relative ${className}`} ref={wrapperRef}>
            <div className={`
                flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all duration-300
                ${isFocused
                    ? 'bg-white border-orange-200 ring-4 ring-orange-50 shadow-lg'
                    : 'bg-slate-50 border-transparent hover:bg-white hover:border-slate-200 hover:shadow-md'
                }
            `}>
                <Search size={20} className={isFocused ? "text-orange-500" : "text-slate-400"} />
                <input
                    type="text"
                    className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-slate-700 placeholder:text-slate-400"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsFocused(true);
                    }}
                    onFocus={() => setIsFocused(true)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                {query && (
                    <button onClick={() => setQuery('')} className="p-1 text-slate-300 hover:text-slate-500 rounded-full hover:bg-slate-100">
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Dropdown Results */}
            {isFocused && query.length >= 2 && (acUserResults.length > 0 || acCollegeResults.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[26rem] overflow-y-auto z-[100] animate-in fade-in zoom-in-95 duration-200 origin-top">

                    {/* User Results */}
                    {acUserResults.length > 0 && (
                        <>
                            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <UserCheck size={14} /> Peers & Students
                            </div>
                            {acUserResults.map((u) => (
                                <button
                                    key={u.id}
                                    onClick={() => handleSelectUser(u.id)}
                                    className="w-full text-left px-5 py-3 hover:bg-orange-50 transition-colors border-b border-slate-50 text-slate-700 hover:text-orange-700 flex items-center gap-3 group"
                                >
                                    <Avatar src={u.avatar_url} alt={u.handle} className="size-8 rounded-full border border-slate-200" />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold truncate flex items-center gap-1.5 text-sm">
                                            {u.handle || 'Anonymous'}
                                            {u.is_verified === 'verified' && <span className="material-symbols-outlined text-blue-500 text-[14px] filled">verified</span>}
                                        </div>
                                        <div className="text-xs text-slate-400 font-medium truncate">
                                            {u.full_name}
                                        </div>
                                    </div>
                                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                                        Profile
                                    </span>
                                </button>
                            ))}
                        </>
                    )}

                    {/* College Results */}
                    {acCollegeResults.length > 0 && (
                        <>
                            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 sticky top-0">
                                <GraduationCap size={14} /> Suggested Colleges
                            </div>
                            {acCollegeResults.map((college, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSelectCollege(college.name)}
                                    className="w-full text-left px-5 py-3 hover:bg-orange-50 transition-colors border-b border-slate-50 text-slate-700 hover:text-orange-700 flex items-center justify-between group"
                                >
                                    <div className="font-bold text-sm">{college.name}</div>
                                    <div className="text-xs text-slate-400 font-medium group-hover:text-orange-400 flex items-center gap-1">
                                        <MapPin size={12} /> {college.state}
                                    </div>
                                </button>
                            ))}
                        </>
                    )}
                </div>
            )}

            {/* Show "No Results" or "Press Enter" hint if no matches but query exists? 
                Keeping it clean for now, minimal UI as per request.
            */}
        </div>
    );
};
