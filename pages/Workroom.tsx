
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dbService as db } from '../services/firestoreService';
import { GlassCard } from '../components/ui/GlassCard';
import {
  MessageSquare,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  Send,
  MoreVertical,
  ChevronLeft,
  User,
  Shield,
  Download,
  Plus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function Workroom() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { error: toastError } = useToast();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('messages');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (jobId) {
      loadWorkroom();
    }
  }, [jobId]);

  const loadWorkroom = async () => {
    try {
      const data = await db.getProjectById(jobId!);
      setJob(data);
    } catch (error) {
      console.error('Error loading workroom:', error);
    } finally {
      setLoading(false);
    }
  };

  const milestones = [
    { id: 1, title: 'Outline & Research', amount: 50, status: 'completed', date: '2026-01-05' },
    { id: 2, title: 'First Draft', amount: 150, status: 'in_progress', date: '2026-01-15' },
    { id: 3, title: 'Final Revision', amount: 100, status: 'pending', date: '2026-01-20' },
  ];

  if (loading) return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">Loading Workroom...</div>;

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col">
      {/* Top Header */}
      <div className="border-b border-slate-800 bg-slate-900/20 p-4 sticky top-0 z-10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">{job?.title || 'Collaboration Room'}</h1>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="flex items-center gap-1 text-green-400 font-medium">
                  <Clock size={12} /> Active Contract
                </span>
                <span>•</span>
                <span>ID: {jobId?.slice(0, 8)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-slate-900/50 border border-slate-800 rounded-lg px-3 py-1.5">
              <Shield size={14} className="text-blue-400" />
              <span className="text-xs text-slate-300">Escrow Protected</span>
            </div>
            <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Sidebar - Milestones & Info */}
        <div className="lg:col-span-4 border-r border-slate-800 p-6 space-y-8 overflow-y-auto">
          {/* Client/Writer Card */}
          <GlassCard className="p-4 border-slate-800/50">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Contract Parties</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white text-xs">H</div>
                <div>
                  <p className="text-sm font-bold text-white">{job?.hirer_name || 'Hirer'}</p>
                  <p className="text-[10px] text-slate-500">Project Owner</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-xs">W</div>
                <div>
                  <p className="text-sm font-bold text-white">{job?.writer_name || 'Assigned Writer'}</p>
                  <p className="text-[10px] text-slate-500">Subject Matter Expert</p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Milestones */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white">Milestones</h3>
              <button className="text-xs text-red-400 hover:underline">Manage</button>
            </div>
            <div className="space-y-3">
              {milestones.map((m) => (
                <div key={m.id} className={`p-4 rounded-xl border transition-all ${m.status === 'completed' ? 'bg-green-500/5 border-green-500/20' :
                  m.status === 'in_progress' ? 'bg-red-500/5 border-red-500/30' :
                    'bg-slate-900/30 border-slate-800/50'
                  }`}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-medium text-white">{m.title}</h4>
                    <span className="text-sm font-bold text-white">${m.amount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] text-slate-500">Due {new Date(m.date).toLocaleDateString()}</p>
                    <div className="flex items-center gap-1">
                      {m.status === 'completed' ? (
                        <span className="text-[10px] text-green-400 font-bold flex items-center gap-1">
                          <CheckCircle2 size={10} /> Paid
                        </span>
                      ) : m.status === 'in_progress' ? (
                        <span className="text-[10px] text-red-400 font-bold">In Review</span>
                      ) : (
                        <span className="text-[10px] text-slate-500">Upcoming</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full py-3 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs hover:text-white hover:border-slate-600 transition-all flex items-center justify-center gap-2">
              <Plus size={14} /> Add Milestone
            </button>
          </div>
        </div>

        {/* Main Area - Tabs */}
        <div className="lg:col-span-8 flex flex-col bg-slate-950/20">
          {/* Tab Headers */}
          <div className="flex border-b border-slate-800 px-6">
            <button
              onClick={() => setActiveTab('messages')}
              className={`py-4 px-6 text-sm font-bold border-b-2 transition-all ${activeTab === 'messages' ? 'border-red-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
            >
              Messages
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`py-4 px-6 text-sm font-bold border-b-2 transition-all ${activeTab === 'files' ? 'border-red-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
            >
              Files & Deliverables
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'messages' ? (
              <div className="space-y-6 h-full flex flex-col">
                <div className="flex-1 space-y-4">
                  {/* Mock Messages */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex-shrink-0" />
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl rounded-tl-none p-3 max-w-[80%]">
                      <p className="text-sm text-slate-300">Hello! I've started the research phase. I'll share the outline by tomorrow evening.</p>
                      <p className="text-[10px] text-slate-500 mt-1">10:45 AM</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-red-600 flex-shrink-0" />
                    <div className="bg-red-600 border border-red-500 rounded-2xl rounded-tr-none p-3 max-w-[80%]">
                      <p className="text-sm text-white">Sounds great. Please focus on the methodology section specifically.</p>
                      <p className="text-[10px] text-red-200 mt-1 text-right">11:02 AM</p>
                    </div>
                  </div>
                </div>

                {/* Input Area */}
                <div className="pt-4 border-t border-slate-800">
                  <div className="relative">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 pr-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
                      rows={2}
                    />
                    <div className="absolute right-3 bottom-3 flex items-center gap-2">
                      <button
                        onClick={() => toastError("File uploads coming soon to Workroom. Please use Direct Chat.")}
                        className="p-2 text-slate-500 hover:text-white transition-colors"
                      >
                        <Paperclip size={18} />
                      </button>
                      <button className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all">
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-white">Shared Files</h3>
                  <button
                    onClick={() => toastError("File uploads coming soon to Workroom. Please use Direct Chat.")}
                    className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-xs text-white hover:bg-slate-800 transition-all flex items-center gap-2"
                  >
                    <Plus size={14} /> Upload File
                  </button>
                </div>
                {[1, 2].map((f) => (
                  <div key={f} className="flex items-center justify-between p-4 bg-slate-900/30 border border-slate-800 rounded-xl hover:bg-slate-900/50 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Research_Notes_v{f}.pdf</p>
                        <p className="text-[10px] text-slate-500">Uploaded 2 days ago • 4.2 MB</p>
                      </div>
                    </div>
                    <button className="p-2 text-slate-500 hover:text-white transition-colors">
                      <Download size={18} />
                    </button>
                  </div>
                ))}
                <div className="mt-8 p-12 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
                  <FileText size={40} className="text-slate-700" />
                  <div>
                    <p className="text-sm text-white font-medium">No deliverables yet</p>
                    <p className="text-xs text-slate-500">Writer will upload final work here for review.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
