
import React, { useState, useEffect } from 'react';
import { dbService as db } from '../services/firestoreService';
import { GlassCard } from '../components/ui/GlassCard';
import { 
  Plus, 
  Search, 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  MoreVertical, 
  Users,
  BarChart3,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function HirerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    try {
      // Assuming a method exists or we use a general query
      const data = await db.getProjectsByHirer(user!.id);
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Active Projects', value: projects.filter(p => p.status === 'active').length, icon: Briefcase, color: 'text-blue-500' },
    { label: 'Pending Proposals', value: projects.reduce((acc, p) => acc + (p.proposals_count || 0), 0), icon: Users, color: 'text-amber-500' },
    { label: 'Completed', value: projects.filter(p => p.status === 'completed').length, icon: CheckCircle2, color: 'text-green-500' },
    { label: 'Total Spent', value: `$${projects.reduce((acc, p) => acc + (p.spent || 0), 0)}`, icon: BarChart3, color: 'text-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-[#020617] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Hirer Dashboard</h1>
            <p className="text-slate-400">Manage your projects and find top talent</p>
          </div>
          <button 
            onClick={() => navigate('/projects/new')}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-red-600/20"
          >
            <Plus size={20} />
            Post a Project
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

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Projects List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Your Projects</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="text" 
                  placeholder="Search projects..."
                  className="bg-slate-900/50 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-slate-900/50 animate-pulse rounded-xl border border-slate-800" />
                ))}
              </div>
            ) : projects.length > 0 ? (
              projects.map((project) => (
                <GlassCard 
                  key={project.id} 
                  className="p-6 border-slate-800/50 hover:border-slate-700/50 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-white group-hover:text-red-400 transition-colors">
                          {project.title}
                        </h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          project.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 line-clamp-2">{project.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Users size={14} /> {project.proposals_count || 0} Proposals</span>
                        <span className="flex items-center gap-1"><Clock size={14} /> Posted {new Date(project.created_at).toLocaleDateString()}</span>
                        <span className="text-red-400 font-medium">${project.budget_min}-${project.budget_max}</span>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
                      <MoreVertical size={20} />
                    </button>
                  </div>
                </GlassCard>
              ))
            ) : (
              <GlassCard className="p-12 border-dashed border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
                <div className="p-4 bg-slate-900 rounded-full text-slate-600">
                  <Briefcase size={40} />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">No projects yet</h3>
                  <p className="text-sm text-slate-400">Post your first project to start finding talented writers.</p>
                </div>
                <button 
                  onClick={() => navigate('/projects/new')}
                  className="text-red-400 font-semibold hover:text-red-300 transition-colors"
                >
                  Create Project →
                </button>
              </GlassCard>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <GlassCard className="p-6 border-slate-800/50 space-y-4">
              <h3 className="text-lg font-bold text-white">Recommended Talent</h3>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-purple-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white group-hover:text-red-400 transition-colors">Talent Name {i}</p>
                      <p className="text-xs text-slate-500">Academic Writer • 4.9★</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-600 group-hover:text-white transition-colors" />
                  </div>
                ))}
              </div>
              <button 
                onClick={() => navigate('/talent')}
                className="w-full py-2 text-sm text-slate-400 hover:text-white border border-slate-800 rounded-lg transition-colors"
              >
                View More Talent
              </button>
            </GlassCard>

            {/* Upcoming Deadlines */}
            <GlassCard className="p-6 border-slate-800/50 space-y-4">
              <h3 className="text-lg font-bold text-white">Upcoming Deadlines</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 border-l-2 border-red-500 pl-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Final Thesis Draft</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1"><Calendar size={12} /> Oct 24, 2026</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 border-l-2 border-amber-500 pl-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Case Study Review</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1"><Calendar size={12} /> Oct 28, 2026</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
