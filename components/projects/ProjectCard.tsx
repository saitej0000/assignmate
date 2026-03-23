import React, { useState } from 'react';
import { Calendar, FolderPlus, Users, MoreVertical, CheckCircle, XCircle } from 'lucide-react';
import { dbService } from '../../services/firestoreService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface ProjectCardProps {
    project: any;
    onUpdate: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onUpdate }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { success, error } = useToast();
    const [showMenu, setShowMenu] = useState(false);
    const [updating, setUpdating] = useState(false);

    const handleStatusChange = async (newStatus: 'completed' | 'cancelled') => {
        if (!user) return;
        setUpdating(true);
        try {
            await dbService.updateOrderStatus(project.id, newStatus, user.id);
            success(`Project marked as ${newStatus}`);
            onUpdate();
        } catch (err: any) {
            console.error("Failed to update status", err);
            error(err.message || "Failed to update project");
        } finally {
            setUpdating(false);
            setShowMenu(false);
        }
    };

    const budgetVal = project.amount || project.budget || 0;
    const isPaid = budgetVal > 0;

    return (
        <div
            onClick={() => navigate(`/projects/${project.id}`)}
            className="group bg-white p-6 rounded-[2rem] border border-border-subtle shadow-card hover:shadow-soft hover:border-primary/20 transition-all duration-300 flex flex-col gap-4 relative cursor-pointer"
        >
            {/* Header */}
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-text-dark group-hover:text-primary transition-colors line-clamp-1">{project.title || 'Untitled Project'}</h3>
                    <div className="flex items-center gap-2 mt-1.5 text-sm font-medium text-text-muted">
                        <div className="size-6 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                            {project.writer_avatar ? (
                                <img src={project.writer_avatar} alt="Avatar" className="size-6 rounded-full object-cover" />
                            ) : (
                                <Users size={12} className="text-gray-500" />
                            )}
                        </div>
                        <span>With <span className="text-text-dark font-bold">{project.writer_handle || 'Unknown Peer'}</span></span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className={`shrink-0 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${project.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-orange-50 text-orange-600'}`}>
                        {project.status === 'in_progress' ? 'In Progress' : project.status || 'Active'}
                    </span>

                    {/* Action Menu Trigger (Only for active projects) */}
                    {project.status === 'in_progress' && (
                        <div className="relative">
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
                            >
                                <MoreVertical size={18} />
                            </button>

                            <AnimatePresence>
                                {showMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        onClick={(e) => e.stopPropagation()}
                                        className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-10 overflow-hidden"
                                    >
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleStatusChange('completed'); }}
                                            disabled={updating}
                                            className="w-full text-left px-4 py-3 text-sm font-bold text-green-600 hover:bg-green-50 flex items-center gap-2 transition-colors"
                                        >
                                            <CheckCircle size={16} />
                                            Mark Complete
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleStatusChange('cancelled'); }}
                                            disabled={updating}
                                            className="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors border-t border-gray-100"
                                        >
                                            <XCircle size={16} />
                                            Cancel Project
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>

            {/* Description */}
            <p className="text-sm text-text-muted leading-relaxed line-clamp-2 min-h-[2.5rem]">
                {project.description || 'No description provided.'}
            </p>

            {/* Footer Details */}
            <div className="flex items-center justify-between pt-4 border-t border-border-subtle mt-auto">
                <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1.5 text-text-muted bg-gray-50 px-2.5 py-1 rounded-lg">
                        <Calendar size={14} className="text-orange-500" />
                        <span className="font-bold text-text-dark text-xs">
                            {project.deadline ? new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Deadline'}
                        </span>
                    </div>
                    {project.pages > 0 && (
                        <div className="hidden sm:flex items-center gap-1.5 text-text-muted bg-gray-50 px-2.5 py-1 rounded-lg">
                            <FolderPlus size={14} className="text-blue-500" />
                            <span className="font-bold text-text-dark text-xs">{project.pages} Pages</span>
                        </div>
                    )}
                </div>

                <div className="text-right">
                    {isPaid ? (
                        <span className="text-lg font-extrabold text-[#111827]">${budgetVal.toLocaleString()}</span>
                    ) : (
                        <span className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">Free Collaboration</span>
                    )}
                </div>
            </div>

            {/* Backdrop for menu */}
            {showMenu && (
                <div className="fixed inset-0 z-0" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
            )}
        </div>
    );
};
