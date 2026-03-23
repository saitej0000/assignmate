import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { shareContent } from '../utils/share';
import { dbService as db } from '../services/firestoreService';
import {
  Clock,
  DollarSign,
  MapPin,
  ChevronLeft,
  Share2,
  Flag,
  CheckCircle2,
  AlertCircle,
  Send,
  Loader2,
  Calendar
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Sidebar } from '../components/dashboard/Sidebar';
import { MobileNav } from '../components/dashboard/MobileNav';
import { Avatar } from '../components/ui/Avatar';
import { format } from 'date-fns';

export default function JobDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [proposal, setProposal] = useState('');

  const [renegotiating, setRenegotiating] = useState(false);
  const [newBudget, setNewBudget] = useState(0);
  const [newDeadline, setNewDeadline] = useState('');
  const [progress, setProgress] = useState(0);
  const [updating, setUpdating] = useState(false);
  const [collaborator, setCollaborator] = useState<any>(null);

  const handleShare = async () => {
    if (!job) return;
    const result = await shareContent(
      `Check out this project: ${job.title}`,
      `I found this interesting project on AssignMate: ${job.title}`
    );

    if (result === 'copied') {
      toast('Link copied to clipboard', 'success');
    }
  };

  useEffect(() => {
    if (jobId) {
      loadJob();
    }
  }, [jobId]);

  useEffect(() => {
    if (job && user) {
      setProgress(job.completion_percentage || 0);
      setNewBudget(job.budget || 0);
      setNewDeadline(job.deadline || '');

      // Determine collaborator ID
      const isOwner = user.id === job.student_id;
      // If owner, collaborator is writer. If writer/applicant, collaborator is student (owner).
      const collaboratorId = isOwner ? job.writer_id : job.student_id;

      if (collaboratorId) {
        db.getUser(collaboratorId).then(setCollaborator).catch(console.error);
      }
    }
  }, [job, user]);

  const loadJob = async () => {
    try {
      const data = await db.getProjectById(jobId!);
      setJob(data);
    } catch (error) {
      console.error('Error loading job:', error);
      toast('Failed to load project details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!proposal.trim()) return;

    setApplying(true);
    try {
      await db.submitProposal(jobId!, {
        writer_id: user.id,
        writer_name: user.handle,
        cover_letter: proposal,
        status: 'pending'
      });
      toast('Proposal submitted successfully!', 'success');
      setProposal('');
    } catch (error) {
      console.error('Error applying:', error);
      toast('Failed to submit proposal', 'error');
    } finally {
      setApplying(false);
    }
  };

  const handleUpdateProgress = async () => {
    if (!user || !job) return;
    setUpdating(true);
    try {
      await db.updateOrderStatus(job.id, job.status, user.id);

      const { doc, updateDoc, getFirestore } = await import('firebase/firestore');
      await updateDoc(doc(getFirestore(), 'orders', job.id), {
        completion_percentage: progress,
        updated_at: new Date().toISOString()
      });

      toast('Progress updated!', 'success');
      setJob((prev: any) => ({ ...prev, completion_percentage: progress }));
    } catch (error) {
      console.error("Failed to update progress", error);
      toast('Failed to update progress', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleRenegotiate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !job) return;

    setUpdating(true);
    try {
      await db.sendRenegotiation(
        job.chat_id,
        job.id,
        user.id,
        user.handle || user.full_name,
        {
          title: job.title,
          description: job.description,
          deadline: newDeadline,
          budget: Number(newBudget),
          pages: job.pages || 0
        }
      );
      toast('Renegotiation offer sent to chat!', 'success');
      setRenegotiating(false);
    } catch (error) {
      console.error("Failed to send renegotiation", error);
      toast('Failed to send request', 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-background text-text-dark antialiased h-screen flex items-center justify-center font-display">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="bg-background text-text-dark antialiased h-screen flex flex-col items-center justify-center font-display space-y-4">
        <AlertCircle size={48} className="text-gray-400" />
        <h2 className="text-xl font-bold text-gray-800">Project Not Found</h2>
        <button onClick={() => navigate('/projects')} className="text-primary hover:underline font-bold">Back to Projects</button>
      </div>
    );
  }

  const isOwner = user?.id === job.student_id;
  const isWriter = user?.id === job.writer_id;
  const isParticipant = isOwner || isWriter;

  const budgetVal = job.amount || job.budget_min || job.budget || 0;
  const isPaid = budgetVal > 0;

  return (
    <div className="bg-background text-text-dark antialiased h-screen overflow-hidden flex selection:bg-primary/20 font-display">
      <Sidebar user={user} />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#F9FAFB]">
        <div className="flex-1 overflow-y-auto px-4 md:px-8 pt-6 pb-20">
          <div className="max-w-6xl mx-auto space-y-6">

            {/* Header / Nav */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="size-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-all shadow-sm"
              >
                <ChevronLeft size={20} />
              </button>
              <h1 className="text-2xl font-bold text-[#111827]">Project Details</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Details Column */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-8">
                  <div className="space-y-6">
                    <div className="flex justify-between items-start gap-4">
                      <h1 className="text-3xl font-bold text-[#111827] leading-tight">{job.title}</h1>
                      <div className="flex gap-2">
                        <button
                          onClick={handleShare}
                          className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 hover:text-[#111827] transition-all"
                        >
                          <Share2 size={18} />
                        </button>
                        <button className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 hover:text-red-500 transition-all">
                          <Flag size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm">
                      {isPaid ? (
                        <div className="flex items-center gap-1.5 text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full border border-green-100">
                          <DollarSign size={16} />
                          ${budgetVal.toLocaleString()}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-500 font-bold bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                          Free Collaboration
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                        <Clock size={16} />
                        Due {format(new Date(job.deadline || job.created_at), 'MMM d, yyyy')}
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                        <MapPin size={16} />
                        Remote
                      </div>
                    </div>

                    {isParticipant && job.status === 'in_progress' && (
                      <div className="py-6 border-y border-gray-100 space-y-5">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                            <span className="material-symbols-outlined text-orange-500">engineering</span>
                            Project Progress
                          </h3>
                          <span className="text-2xl font-bold text-orange-500">{progress}%</span>
                        </div>

                        <div className="relative pt-1">
                          <div className="flex mb-2 items-center justify-between">
                          </div>
                          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-orange-100">
                            <div style={{ width: `${progress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-orange-500 transition-all duration-500"></div>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={progress}
                            onChange={(e) => setProgress(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500 absolute top-2 opacity-0 hover:opacity-10 transition-opacity"
                          />
                          <p className="text-xs text-gray-400 text-center">Drag slider to update</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={handleUpdateProgress}
                            disabled={updating}
                            className="px-5 py-2.5 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
                          >
                            {updating ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                            Update Progress
                          </button>
                          <button
                            onClick={() => setRenegotiating(!renegotiating)}
                            className="px-5 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-xl">edit_note</span>
                            Renegotiate Terms
                          </button>
                        </div>

                        {renegotiating && (
                          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-4 animate-in fade-in slide-in-from-top-2">
                            <h4 className="font-bold text-[#111827]">Propose New Terms</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-xs text-gray-500 font-bold uppercase">New Budget</label>
                                <div className="relative">
                                  <span className="absolute left-3 top-2.5 text-gray-500 text-sm">$</span>
                                  <input
                                    type="number"
                                    value={newBudget}
                                    onChange={(e) => setNewBudget(Number(e.target.value))}
                                    className="w-full bg-white border border-gray-200 rounded-xl p-2 pl-6 text-[#111827] focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                  />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs text-gray-500 font-bold uppercase">New Deadline</label>
                                <input
                                  type="date"
                                  value={newDeadline}
                                  onChange={(e) => setNewDeadline(e.target.value)}
                                  className="w-full bg-white border border-gray-200 rounded-xl p-2 text-[#111827] focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setRenegotiating(false)}
                                className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-800"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleRenegotiate}
                                disabled={updating}
                                className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"
                              >
                                Send Proposal
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-[#111827] border-b border-gray-100 pb-2">Description</h3>
                      <div className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                        {job.description}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-[#111827] border-b border-gray-100 pb-2">Required Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {(job.skills || ['Academic Writing', 'Research', 'English Proficiency']).map((skill: string, i: number) => (
                          <span key={i} className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Application Section - Only show if Writer and NOT active */}
                {user?.is_writer && !isParticipant && (
                  <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-8 space-y-4">
                    <h3 className="text-xl font-bold text-[#111827] flex items-center gap-2">
                      <Send size={24} className="text-red-500" />
                      Apply for this Project
                    </h3>
                    <form onSubmit={handleApply} className="space-y-4">
                      <textarea
                        value={proposal}
                        onChange={(e) => setProposal(e.target.value)}
                        placeholder="Describe why you're a good fit for this project..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-[#111827] min-h-[150px] focus:ring-2 focus:ring-red-500/10 focus:border-red-500 focus:outline-none transition-all placeholder-gray-400"
                        required
                      />
                      <button
                        type="submit"
                        disabled={applying}
                        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                      >
                        {applying ? <Loader2 className="animate-spin" /> : 'Submit Proposal'}
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* Sidebar Column */}
              <div className="space-y-6">
                <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-6 space-y-4">
                  <h3 className="text-lg font-bold text-[#111827] border-b border-gray-100 pb-2">About the Collaborator</h3>
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={collaborator?.avatar_url || job.hirer_avatar}
                      alt={collaborator?.full_name || collaborator?.handle || 'User'}
                      className="size-12 rounded-full ring-2 ring-gray-100"
                      fallback={(collaborator?.handle || 'U').charAt(0)}
                    />
                    <div>
                      <p className="font-bold text-[#111827]">{collaborator?.full_name || collaborator?.handle || job.writer_handle || job.hirer_name || 'Project Member'}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        {collaborator?.created_at ? (
                          <span className="flex items-center gap-1">
                            <Calendar size={12} className="text-orange-500" />
                            {format(new Date(collaborator.created_at), 'MMMM yyyy')}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 size={12} className="text-blue-500" />
                            Verified Member
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Level</p>
                      <p className="text-sm font-bold text-[#111827]">{Math.floor((collaborator?.xp || 0) / 100) + 1}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Completed</p>
                      <p className="text-sm font-bold text-[#111827]">{collaborator?.projects_completed || 0}</p>
                    </div>
                  </div>
                  <button onClick={() => collaborator?.id && navigate(`/profile/${collaborator.id}`)} className="w-full py-2.5 text-sm font-bold text-gray-500 hover:text-[#111827] border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                    View Profile
                  </button>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-white rounded-[1.5rem] border border-indigo-100 shadow-sm p-6 space-y-4">
                  <h3 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                    <AlertCircle size={20} className="text-indigo-500" />
                    Safety Tips
                  </h3>
                  <ul className="text-xs text-gray-600 space-y-2 list-disc pl-4 leading-relaxed">
                    <li>Never share personal contact info before a contract.</li>
                    <li>Work within the Assignmate Workroom offering protection.</li>
                    <li>Ensure milestones are funded before starting.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
