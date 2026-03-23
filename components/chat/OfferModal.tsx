import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MotionDiv = motion.div as any;

interface CollabModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (collab: CollabData) => void;
    recipientName?: string;
}

export interface CollabData {
    title: string;
    description: string;
    deadline: string;
    isPaid: boolean;
    budget: number;
}

// Keep OfferData for backward compatibility
export interface OfferData {
    subject: string;
    title: string;
    description: string;
    pages: number;
    deadline: string;
    budget: number;
    currency: string;
}

export const OfferModal: React.FC<CollabModalProps> = ({ isOpen, onClose, onSubmit, recipientName }) => {
    const [formData, setFormData] = useState<CollabData>({
        title: '',
        description: '',
        deadline: '',
        isPaid: false,
        budget: 0
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.deadline) {
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            // Reset form
            setFormData({
                title: '',
                description: '',
                deadline: '',
                isPaid: false,
                budget: 0
            });
            onClose();
        } catch (error) {
            console.error('Failed to send collab request', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Get minimum date (today)
    const minDate = new Date().toISOString().split('T')[0];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <MotionDiv
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <MotionDiv
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-border-subtle px-6 py-4 flex items-center justify-between z-10">
                            <div>
                                <h2 className="text-xl font-bold text-text-dark flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">handshake</span>
                                    Collab for Project
                                </h2>
                                <p className="text-sm text-text-muted">
                                    Invite {recipientName || 'this person'} to collaborate
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="size-10 rounded-full hover:bg-secondary-bg flex items-center justify-center text-text-muted transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
                            {/* Project Name */}
                            <div>
                                <label className="block text-sm font-bold text-text-dark mb-2">
                                    Project Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., Mobile App Development, Research Paper"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-border-subtle bg-secondary-bg text-text-dark font-medium placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-bold text-text-dark mb-2">
                                    Project Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe what you want to build together, goals, your role, their expected contribution..."
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border border-border-subtle bg-secondary-bg text-text-dark font-medium placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                                />
                            </div>

                            {/* Expected End Date */}
                            <div>
                                <label className="block text-sm font-bold text-text-dark mb-2">
                                    Expected End Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                    min={minDate}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-border-subtle bg-secondary-bg text-text-dark font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                />
                            </div>

                            {/* Free or Paid Toggle */}
                            <div>
                                <label className="block text-sm font-bold text-text-dark mb-3">
                                    Project Type
                                </label>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, isPaid: false, budget: 0 })}
                                        className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-2 ${!formData.isPaid
                                                ? 'border-green-500 bg-green-50 text-green-700'
                                                : 'border-gray-200 bg-white text-text-muted hover:border-gray-300'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-lg">volunteer_activism</span>
                                        Free Collab
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, isPaid: true, budget: 500 })}
                                        className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-2 ${formData.isPaid
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-gray-200 bg-white text-text-muted hover:border-gray-300'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-lg">payments</span>
                                        Paid Project
                                    </button>
                                </div>
                            </div>

                            {/* Budget (only if paid) */}
                            {formData.isPaid && (
                                <div className="animate-fade-in">
                                    <label className="block text-sm font-bold text-text-dark mb-2">
                                        Budget (₹)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">₹</span>
                                        <input
                                            type="number"
                                            min="100"
                                            step="50"
                                            value={formData.budget}
                                            onChange={(e) => setFormData({ ...formData, budget: Math.max(100, parseInt(e.target.value) || 100) })}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-subtle bg-secondary-bg text-text-dark font-bold text-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                        />
                                    </div>
                                    <p className="text-xs text-text-muted mt-1.5">
                                        💡 This is negotiable. Your collaborator may suggest changes.
                                    </p>
                                </div>
                            )}

                            {/* Preview Card */}
                            {formData.title && (
                                <div className="bg-gradient-to-br from-primary/5 to-orange-500/5 border border-primary/20 rounded-2xl p-4">
                                    <h4 className="text-sm font-bold text-text-dark mb-3 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-lg">preview</span>
                                        Collab Request Preview
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-text-muted">Project</span>
                                            <span className="font-bold text-text-dark truncate max-w-[200px]">{formData.title}</span>
                                        </div>
                                        {formData.deadline && (
                                            <div className="flex justify-between">
                                                <span className="text-text-muted">End Date</span>
                                                <span className="font-bold text-text-dark">{new Date(formData.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between pt-2 border-t border-primary/20">
                                            <span className="text-text-muted">Type</span>
                                            <span className={`font-bold ${formData.isPaid ? 'text-primary' : 'text-green-600'}`}>
                                                {formData.isPaid ? `₹${formData.budget.toLocaleString()} Paid` : '🤝 Free Collaboration'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-white border-t border-border-subtle px-6 py-4 flex items-center justify-between gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 rounded-xl bg-secondary-bg text-text-muted font-bold hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !formData.title || !formData.deadline}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-orange-500 text-white font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-lg">refresh</span>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-lg">send</span>
                                        Send Collab Request
                                    </>
                                )}
                            </button>
                        </div>
                    </MotionDiv>
                </div>
            )}
        </AnimatePresence>
    );
};
