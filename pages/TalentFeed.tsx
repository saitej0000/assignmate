
import React, { useState, useEffect } from 'react';
import { dbService as db } from '../services/firestoreService';
import { GlassCard } from '../components/ui/GlassCard';
import {
  Search,
  Filter,
  Star,
  MapPin,
  MessageSquare,
  UserPlus,
  ChevronRight,
  ShieldCheck,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function TalentFeed() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [talent, setTalent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadTalent();
  }, [filter]);

  const loadTalent = async () => {
    setLoading(true);
    try {
      // Assuming a method exists or we use a general query
      const data = await db.getAllTalent(filter);
      setTalent(data);
    } catch (error) {
      console.error('Error loading talent:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All Talent' },
    { id: 'academic', label: 'Academic Writers' },
    { id: 'technical', label: 'Technical' },
    { id: 'creative', label: 'Creative' },
    { id: 'verified', label: 'Verified Only' },
  ];

  return (
    <div className="min-h-screen bg-[#020617] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-white">Browse Talent</h1>
          <p className="text-slate-400">Connect with the best academic and technical writers in the industry.</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Search by skill, name, or keywords..."
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-6 py-4 rounded-2xl text-white hover:bg-slate-800 transition-colors">
            <Filter size={20} />
            Filters
          </button>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-6 py-2 rounded-full whitespace-nowrap transition-all ${filter === cat.id
                  ? 'bg-red-600 text-white font-semibold'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Talent Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-slate-900/50 animate-pulse rounded-2xl border border-slate-800" />
            ))}
          </div>
        ) : talent.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {talent.map((person) => (
              <GlassCard
                key={person.id}
                className="p-6 border-slate-800/50 hover:border-slate-700/50 transition-all group cursor-pointer"
                onClick={() => navigate(`/profile/${person.id}`)}
              >
                <div className="space-y-6">
                  {/* Profile Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold overflow-hidden">
                          {person.avatar_url ? (
                            <img src={person.avatar_url} alt={person.handle} className="w-full h-full object-cover rounded-full" />
                          ) : (
                            person.handle?.[0]?.toUpperCase() || 'U'
                          )}
                        </div>
                        {person.is_verified && (
                          <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 border-2 border-[#020617]">
                            <ShieldCheck size={12} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-white group-hover:text-red-400 transition-colors">
                          {person.handle}
                        </h3>
                        <p className="text-sm text-slate-400">{person.specialty || 'Generalist Writer'}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="text-amber-500 fill-amber-500" size={14} />
                          <span className="text-xs text-white font-medium">{person.rating || '5.0'}</span>
                          <span className="text-xs text-slate-500">({person.reviews_count || 0})</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">${person.hourly_rate || '25'}/hr</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Rate</p>
                    </div>
                  </div>

                  {/* Skills/Tags */}
                  <div className="flex flex-wrap gap-2">
                    {(person.skills || ['Academic', 'Research', 'APA']).map((skill: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-slate-900/50 text-slate-400 text-[10px] rounded-lg border border-slate-800">
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Bio Placeholder */}
                  <p className="text-sm text-slate-400 line-clamp-2">
                    {person.bio || 'Highly skilled writer with over 5 years of experience in academic and technical fields...'}
                  </p>

                  {/* Footer Actions */}
                  <div className="pt-4 border-t border-slate-800/50 flex gap-2">
                    <button className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                      <Zap size={16} /> Hire
                    </button>
                    <button className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-xl transition-colors">
                      <MessageSquare size={20} />
                    </button>
                    <button className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-xl transition-colors">
                      <UserPlus size={20} />
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard className="p-12 border-dashed border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 bg-slate-900 rounded-full text-slate-600">
              <Search size={40} />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">No talent found</h3>
              <p className="text-sm text-slate-400">Try adjusting your filters or search terms.</p>
            </div>
            <button
              onClick={() => setFilter('all')}
              className="text-red-400 font-semibold hover:text-red-300 transition-colors"
            >
              Clear Filters
            </button>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
