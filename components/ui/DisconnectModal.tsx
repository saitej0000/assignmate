import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';

interface DisconnectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    userName: string;
}

export default function DisconnectModal({ isOpen, onClose, onConfirm, userName }: DisconnectModalProps) {
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        await onConfirm(reason);
        setIsSubmitting(false);
        setReason(''); // Reset
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-[#121212] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-white/5">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                                Disconnect User
                            </h3>
                            <button
                                onClick={onClose}
                                className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                            <p className="text-white/70 text-sm leading-relaxed">
                                Are you sure you want to disconnect from <span className="font-semibold text-white">{userName}</span>?
                                You will no longer see their updates or be able to message them directly.
                            </p>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
                                    Reason (Optional)
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Help us improve. Why are you disconnecting?"
                                    className="w-full h-24 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none placeholder:text-white/20 transition-all"
                                />
                                <p className="text-[10px] text-white/40">
                                    This information is strictly confidential and helps us maintain community safety.
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-5 border-t border-white/5 flex gap-3 justify-end bg-white/5">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 active:scale-95 rounded-lg shadow-lg shadow-red-500/20 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
                            >
                                {isSubmitting ? 'Disconnecting...' : 'Disconnect'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
