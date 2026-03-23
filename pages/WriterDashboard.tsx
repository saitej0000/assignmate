
import React, { useState, useEffect } from 'react';
import { dbService as db } from '../services/firestoreService';
import { GlassCard } from '../components/ui/GlassCard';
import {
  Briefcase,
  Clock,
  CheckCircle2,
  DollarSign,
  Star,
  Trophy,
  TrendingUp,
  MessageSquare,
  Search,
  Filter,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function WriterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadWriterData();
    }
  }, [user]);

  const loadWriterData = async () => {
    try {
      // Assuming a method exists or we use a general query
      const jobs = await db.getJobsByWriter(user!.id);
      setActiveJobs(jobs);
    } catch (error) {
      console.error('Error loading writer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Active Jobs', value: activeJobs.filter(j => j.status === 'in_progress').length, icon: Briefcase, color: 'text-blue-500' },
    { label: 'Total Earned', value: `$${user?.total_earned || 0}`, icon: DollarSign, color: 'text-green-500' },
    { label: 'Rating', value: `${user?.rating || '5.0'}`, icon: Star, color: 'text-amber-500' },
    { label: 'Completed', value: activeJobs.filter(j => j.status === 'completed').length, icon: CheckCircle2, color: 'text-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-[#020617] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              {user?.handle?.[0]?.toUpperCase() || 'W'}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Welcome back, {user?.handle || 'Writer'}!</h1>
              <p className="text-slate-400">You have {activeJobs.filter(j => j.status === 'in_progress').length} active projects today.</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 px-6 py-3 rounded-xl font-semibold transition-all"
          >
            <Search size={20} />
            Find New Work
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <GlassCard key={i} className="p-6 border-slate-800/50">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-slate-900/50 ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Work */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Active Workroom</h2>
              <button className="text-sm text-red-400 font-medium hover:text-red-300">View All →</button>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="h-40 bg-slate-900/50 animate-pulse rounded-xl border border-slate-800" />
                ))}
              </div>
            ) : activeJobs.length > 0 ? (
              activeJobs.map((job) => (
                <GlassCard
                  key={job.id}
                  className="p-6 border-slate-800/50 hover:border-slate-700/50 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/workroom/${job.id}`)}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-white group-hover:text-red-400 transition-colors">
                          {job.title}
                        </h3>
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase">
                          In Progress
                        </span>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Client</p>
                          <p className="text-sm text-white">{job.hirer_name || 'Anonymous'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Deadline</p>
                          <p className="text-sm text-red-400">{new Date(job.deadline).toLocaleDateString()}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Earnings</p>
                          <p className="text-sm text-green-400">${job.amount || '0.00'}</p>
                        </div>
                      </div>
                      {/* Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>Progress</span>
                          <span>{job.progress || 0}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-red-500 to-purple-600 transition-all duration-500"
                            style={{ width: `${job.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button className="p-2 bg-slate-900 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <MessageSquare size={18} />
                      </button>
                      <button className="p-2 bg-slate-900 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                </GlassCard>
              ))
            ) : (
              <GlassCard className="p-12 border-dashed border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
                <div className="p-4 bg-slate-900 rounded-full text-slate-600">
                  <Trophy size={40} />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">No active jobs</h3>
                  <p className="text-sm text-slate-400">Submit proposals to start earning today.</p>
                </div>
                <button
                  onClick={() => navigate('/projects')}
                  className="text-red-400 font-semibold hover:text-red-300 transition-colors"
                >
                  Browse Projects →
                </button>
              </GlassCard>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Writer Rank */}
            <GlassCard className="p-6 border-slate-800/50 bg-gradient-to-br from-slate-900/50 to-red-950/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-500/10 text-red-500 rounded-xl">
                  <Trophy size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Pro Writer</h3>
                  <p className="text-xs text-slate-400">Top 5% of all writers</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Next Level: Elite</span>
                  <span className="text-white">850/1000 XP</span>
                </div>
                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 w-[85%]" />
                </div>
              </div>
            </GlassCard>

            {/* Quick Tips */}
            <GlassCard className="p-6 border-slate-800/50 space-y-4">
              <h3 className="text-lg font-bold text-white">Earning Insights</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 text-green-500 rounded-lg">
                    <TrendingUp size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white">Trending High</p>
                    <p className="text-[10px] text-slate-500">Academic Case Studies (+12%)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                    <Star size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white">Success Tip</p>
                    <p className="text-[10px] text-slate-500">Complete profile to get 2x more invites</p>
                  </div>
                </div>
              </div>
              <button className="w-full py-2 text-sm text-slate-400 hover:text-white border border-slate-800 rounded-lg transition-colors">
                View Earnings Report
              </button>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
