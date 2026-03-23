import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dbService } from '../services/firestoreService';
import { collegeService, College } from '../services/collegeService';
import { User } from '../types';
import { Avatar } from '../components/ui/Avatar';
import { Search, Filter, CheckCircle2, Circle, GraduationCap, MapPin, Star, UserCheck, Loader2, X } from 'lucide-react';

export const FindWriter = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // State
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [connectionIds, setConnectionIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [filterType, setFilterType] = useState<'all' | 'contributors' | 'verified' | 'online' | 'network'>('all');
    const [sortBy, setSortBy] = useState<'relevance' | 'rating'>('relevance');

    // Autocomplete State
    const [acOpen, setAcOpen] = useState(false);
    const [acCollegeResults, setAcCollegeResults] = useState<College[]>([]);
    const [acUserResults, setAcUserResults] = useState<User[]>([]);
    const acWrapperRef = useRef<HTMLDivElement>(null);

    const resultsRef = useRef<HTMLDivElement>(null);

    // Initial Fetch
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const [users, connections] = await Promise.all([
                    dbService.getAllUsers() as Promise<User[]>,
                    user?.id ? dbService.getMyConnections(user.id) : Promise.resolve([])
                ]);

                // Filter out current user
                const others = users.filter(u => u.id !== user?.id);
                setAllUsers(others);
                setFilteredUsers(others);

                // Process connection IDs
                const ids = new Set<string>();
                connections.forEach((conn: any) => {
                    // Extract ID from connection object (handles both populated User objects and raw IDs)
                    const otherId = conn.participants?.find((p: any) => (p.id || p) !== user?.id);
                    const actualId = typeof otherId === 'object' ? otherId.id : otherId;
                    if (actualId) ids.add(actualId);

                    // Also check for direct ID if the structure is different
                    if (conn.id && conn.id !== user?.id) ids.add(conn.id);
                });
                setConnectionIds(ids);

            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [user?.id]);

    // Autocomplete Logic (Combined)
    useEffect(() => {
        if (!searchQuery.trim() || searchQuery.length < 2) {
            setAcCollegeResults([]);
            setAcUserResults([]);
            return;
        }

        const q = searchQuery.toLowerCase();

        // 1. Search Users (Peers)
        // Prioritize: Handle match > Name match
        const users = allUsers.filter(u =>
            (u.handle?.toLowerCase().includes(q)) ||
            (u.full_name?.toLowerCase().includes(q))
        ).slice(0, 5); // Limit user results
        setAcUserResults(users);

        // 2. Search Colleges (Debounced)
        let active = true;

        const timerId = setTimeout(async () => {
            if (!active) return;
            try {
                const matches = await collegeService.search(searchQuery); // Pass original query (service handles case) or q
                if (active) {
                    setAcCollegeResults(matches.slice(0, 5));
                }
            } catch (error) {
                console.error("Autosuggest error:", error);
            }
        }, 300);

        return () => {
            active = false;
            clearTimeout(timerId);
        };
    }, [searchQuery, allUsers]);

    // Click outside handler for autocomplete
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (acWrapperRef.current && !acWrapperRef.current.contains(event.target as Node)) {
                setAcOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [acWrapperRef]);

    const handleSelectCollege = (name: string) => {
        setSearchQuery(name);
        setAcOpen(false);
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSelectUser = (userId: string) => {
        navigate(`/profile/${userId}`);
        setAcOpen(false);
    };

    // Filtering Logic
    useEffect(() => {
        let result = [...allUsers];

        // 1. Search Query
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(u =>
                (u.full_name?.toLowerCase() || '').includes(lowerQuery) ||
                (u.handle?.toLowerCase() || '').includes(lowerQuery) ||
                (u.school?.toLowerCase() || '').includes(lowerQuery) ||
                (u.bio?.toLowerCase() || '').includes(lowerQuery)
            );
        }

        // 2. Tab/Filter Type
        const paramTab = searchParams.get('tab');
        const activeFilter = paramTab === 'network' ? 'network' : filterType;

        if (activeFilter === 'contributors') {
            result = result.filter(u => u.is_writer);
        } else if (activeFilter === 'verified') {
            result = result.filter(u => u.is_verified === 'verified');
        } else if (activeFilter === 'online') {
            // Filter for users active in the last 24 hours
            const now = new Date().getTime();
            result = result.filter(u => {
                if (!u.last_active) return false;
                const lastActive = new Date(u.last_active).getTime();
                const hoursDiff = (now - lastActive) / (1000 * 60 * 60);
                return hoursDiff <= 24;
            });
        } else if (activeFilter === 'network') {
            result = result.filter(u => u.id && connectionIds.has(u.id));
        }

        setFilteredUsers(result);

    }, [searchQuery, filterType, allUsers, searchParams]);



    return (
        <div className="min-h-screen bg-[#FDFBF9] font-display text-slate-900">
            {/* Navbar */}
            <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-orange-100/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    {/* Left: Logo */}
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-9 h-9 rounded-lg overflow-hidden shadow-sm">
                            <img src="/logo.png" alt="AssignMate" className="w-full h-full object-cover" />
                        </div>
                        <h2 className="text-[#1b140d] text-xl font-bold tracking-tight">AssignMate</h2>
                    </div>

                    {/* Center: Navigation Links */}
                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
                        <a
                            onClick={() => navigate('/feed')}
                            className="cursor-pointer hover:text-slate-900 transition-colors"
                        >
                            Home
                        </a>
                        <a
                            className="cursor-pointer text-[#FF6B4A] font-bold bg-orange-50 px-3 py-1 rounded-full"
                        >
                            Find Peers
                        </a>
                        <a
                            onClick={() => navigate('/community')}
                            className="cursor-pointer hover:text-slate-900 transition-colors"
                        >
                            Community
                        </a>
                    </nav>

                    {/* Right: Dashboard & Profile */}
                    <div className="flex items-center gap-6">
                        <a
                            onClick={() => navigate('/feed')}
                            className="hidden sm:block text-sm font-bold text-slate-900 hover:text-[#FF6B4A] cursor-pointer transition-colors"
                        >
                            Dashboard
                        </a>
                        {user ? (
                            <div className="relative group cursor-pointer" onClick={() => navigate('/profile')}>
                                <Avatar src={user.avatar_url} alt={user.full_name || user.handle} className="size-10 rounded-full border-2 border-white shadow-md" />
                                <div className="absolute right-0 top-12 bg-white rounded-xl shadow-xl border border-slate-100 p-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right">
                                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                                        <p className="text-sm font-bold text-slate-900 truncate">{user.full_name}</p>
                                        <p className="text-xs text-slate-500 truncate">@{user.handle}</p>
                                    </div>
                                    <button onClick={() => navigate('/feed')} className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors font-medium">Dashboard</button>
                                    <button onClick={() => navigate('/profile')} className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors font-medium">My Profile</button>
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => navigate('/auth')} className="h-10 px-6 rounded-full bg-[#FF6B4A] text-white text-sm font-bold shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:scale-105 transition-all">
                                Login
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <div className="pt-12 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

                {/* Header Section */}
                <div className="text-center space-y-4 mb-12">

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900">
                        Find Your Perfect <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8C42] to-[#FF5E62]">Study Partner</span>
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                        Search by name, college, city, or state to connect with verified peers.
                    </p>
                </div>

                {/* Search Bar - Enhanced */}
                <div className="max-w-3xl mx-auto mb-16 relative z-30" ref={acWrapperRef}>
                    <div className="bg-white p-2 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 flex items-center hover:shadow-[0_8px_30px_rgb(255,107,74,0.1)] transition-shadow duration-300">
                        <div className="pl-6 text-slate-400">
                            <Search size={22} className={`transition-colors ${acOpen ? 'text-orange-500' : ''}`} />
                        </div>
                        <input
                            type="text"
                            className="flex-1 bg-transparent border-none h-14 px-4 text-lg outline-none placeholder:text-slate-400 font-medium text-slate-700"
                            placeholder="Start typing your college name..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setAcOpen(true);
                            }}
                            onFocus={() => setAcOpen(true)}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="p-2 text-slate-300 hover:text-slate-500 mr-2"
                            >
                                <X size={20} />
                            </button>
                        )}
                        <button
                            onClick={() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' })}
                            className="bg-[#FF6B4A] hover:bg-[#ff5530] text-white px-8 h-12 rounded-full font-bold text-lg shadow-lg hover:shadow-orange-200 transition-all flex items-center gap-2"
                        >
                            Search
                        </button>
                    </div>


                    {/* Autocomplete Dropdown */}
                    {acOpen && (acUserResults.length > 0 || acCollegeResults.length > 0) && searchQuery.length >= 2 && (
                        <div className="absolute top-full left-4 right-4 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                            <div className="max-h-[26rem] overflow-y-auto">

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
                                                    <div className="font-bold truncate flex items-center gap-1.5">
                                                        {u.handle || 'Anonymous'}
                                                        {u.is_verified === 'verified' && <span className="material-symbols-outlined text-blue-500 text-[14px] filled">verified</span>}
                                                    </div>
                                                    <div className="text-xs text-slate-400 font-medium truncate">
                                                        {u.full_name} • {u.school || 'College Student'}
                                                    </div>
                                                </div>
                                                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                                                    View Profile
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
                                                <div className="min-w-0 flex-1 mr-4">
                                                    <div className="font-bold truncate">{college.name}</div>
                                                    <div className="text-[10px] text-slate-400 font-medium group-hover:text-orange-500 truncate">
                                                        {[college.university, college.district].filter(Boolean).join(', ')}
                                                    </div>
                                                </div>
                                                <div className="text-xs text-slate-400 font-medium group-hover:text-orange-400 flex items-center gap-1 shrink-0">
                                                    <MapPin size={12} /> {college.state}
                                                </div>
                                            </button>
                                        ))}
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Popular Tags / Smart Suggestions */}
                    <div className="flex flex-wrap items-center justify-center gap-3 mt-6 text-xs font-medium text-slate-400">
                        <span className="uppercase tracking-wide font-bold text-slate-300">Popular Campuses:</span>
                        {[
                            { name: 'JNTUH', type: 'popular' },
                            { name: 'CMR Institute of Technology', type: 'popular' },
                            { name: 'Malla Reddy Institute of Technology', type: 'popular' }
                        ].map(tag => (
                            <button
                                key={tag.name}
                                onClick={() => setSearchQuery(tag.name)}
                                className={`
                                    transition-all px-3 py-1.5 rounded-full cursor-pointer border flex items-center gap-1.5
                                    ${tag.type === 'near'
                                        ? 'bg-orange-50 border-orange-100 text-orange-600 hover:bg-orange-100'
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-orange-200 hover:text-orange-500'
                                    }
                                `}
                            >
                                {tag.type === 'near' && <MapPin size={10} className="text-orange-500" />}
                                {tag.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
                        <button className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg hover:bg-slate-800 transition-all">
                            <Filter size={16} /> Filters
                        </button>
                        <div className="h-6 w-px bg-slate-200 mx-2"></div>
                        <button
                            onClick={() => setFilterType('contributors')}
                            className={`px-5 py-2.5 rounded-full text-sm font-bold border transition-all ${filterType === 'contributors' ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                        >
                            Contributors Only
                        </button>
                        <button
                            onClick={() => setFilterType('verified')}
                            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-bold border transition-all ${filterType === 'verified' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                        >
                            <CheckCircle2 size={16} className={filterType === 'verified' ? 'text-blue-500' : 'text-slate-400'} /> Verified
                        </button>
                        <button
                            onClick={() => setFilterType('online')}
                            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-bold border transition-all ${filterType === 'online' ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                        >
                            <Circle size={10} fill="currentColor" className={filterType === 'online' ? 'text-green-500' : 'text-slate-300'} /> Online Now
                        </button>
                        {/* Clear Filter */}
                        {filterType !== 'all' && (
                            <button onClick={() => { setFilterType('all'); navigate('/peers'); }} className="text-slate-400 hover:text-slate-600 text-xs font-bold underline px-2">Clear</button>
                        )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                        Sort:
                        <select className="bg-transparent font-bold text-slate-900 border-none outline-none cursor-pointer">
                            <option>Relevance</option>
                            <option>Newest</option>
                            <option>Rating</option>
                        </select>
                    </div>
                </div>

                {/* Results Grid */}
                <div ref={resultsRef}>
                    <div className="flex items-center gap-3 mb-4">
                        <h2 className="text-xl font-bold text-slate-900">
                            {(searchParams.get('tab') === 'network' || filterType === 'network') ? 'My Network' : 'All Students'}
                        </h2>
                        {(searchParams.get('tab') === 'network' || filterType === 'network') && (
                            <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                                Your Connections
                            </span>
                        )}
                    </div>
                    <p className="text-slate-500 text-sm mb-6">{filteredUsers.length} students found</p>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i} className="bg-white rounded-[1.5rem] p-6 h-80 animate-pulse border border-slate-100"></div>
                            ))}
                        </div>
                    ) : filteredUsers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {filteredUsers.map((peer) => (
                                <PeerCard key={peer.id} peer={peer} onNavigate={() => navigate(`/profile/${peer.id}`)} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="bg-slate-50 size-24 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                <Search size={40} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">No students found</h3>
                            <p className="text-slate-500">Try adjusting your filters or search query.</p>
                            <button onClick={() => { setSearchQuery(''); setFilterType('all'); }} className="mt-4 text-[#FF6B4A] font-bold hover:underline">Clear all filters</button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

// Peer Card Component
const PeerCard = ({ peer, onNavigate }: { peer: User, onNavigate: () => void }) => {
    // Check if user was active in the last 24 hours
    const isRecentlyActive = () => {
        if (!peer.last_active) return false;
        const lastActive = new Date(peer.last_active);
        const now = new Date();
        const hoursDiff = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
        return hoursDiff <= 24;
    };

    const showGreenDot = isRecentlyActive();

    return (
        <div className="bg-white rounded-[1.5rem] p-5 shadow-[0_2px_15px_-4px_rgba(0,0,0,0.05)] border border-slate-100 hover:border-orange-100 hover:shadow-[0_8px_25px_-4px_rgba(255,107,74,0.1)] transition-all duration-300 group flex flex-col h-full">
            <div className="flex items-start gap-4 mb-4">
                <div className="relative shrink-0">
                    <Avatar src={peer.avatar_url} alt={peer.full_name || peer.handle} className="size-14 rounded-full ring-2 ring-white shadow-sm" />
                    {showGreenDot ?
                        <div className="absolute bottom-0 right-0 size-3.5 bg-green-500 border-2 border-white rounded-full"></div> :
                        <div className="absolute bottom-0 right-0 size-3.5 bg-slate-300 border-2 border-white rounded-full"></div>
                    }
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <h3 className="font-bold text-slate-900 truncate" title={peer.full_name || peer.handle}>
                            {peer.full_name?.split(' ')[0] || peer.handle}
                        </h3>
                        {peer.is_verified === 'verified' && (
                            <span className="material-symbols-outlined text-blue-500 text-[18px] filled">verified</span>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium truncate flex items-center gap-1" title={peer.school}>
                        <GraduationCap size={12} />
                        {peer.school || 'College Student'}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded text-xs font-bold text-yellow-700">
                            <Star size={10} fill="currentColor" /> {peer.rating?.toFixed(1) || '5.0'}
                        </div>
                        {peer.is_writer && (
                            <span className="bg-orange-50 text-orange-600 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">Contributor</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="mb-6 flex-1">
                <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed h-10">
                    {peer.bio || "Student at " + (peer.school || "University") + ". Open to connecting for study collaborations."}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">General</span>
                </div>
            </div>

            <button onClick={onNavigate} className="w-full py-3 rounded-xl bg-[#FFF6F4] text-[#FF6B4A] font-bold text-sm hover:bg-[#FF6B4A] hover:text-white transition-all flex items-center justify-center gap-2 group-hover:shadow-md">
                View Profile <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
            </button>
        </div>
    );
};
