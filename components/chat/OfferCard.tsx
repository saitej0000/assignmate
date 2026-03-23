import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const MotionDiv = motion.div as any;

interface OfferCardProps {
    offer: {
        id?: string;
        subject: string;
        title: string;
        description?: string;
        pages: number;
        deadline: string;
        budget: number;
        status: 'pending' | 'accepted' | 'rejected';
        senderId: string;
        senderName?: string;
        orderId?: string;
    };
    isOwn: boolean;
    onAccept?: () => void;
    onReject?: () => void;
    isLoading?: boolean;
    timestamp?: string;
}

export const OfferCard: React.FC<OfferCardProps> = ({
    offer,
    isOwn,
    onAccept,
    onReject,
    isLoading = false,
    timestamp
}) => {
    const [actionLoading, setActionLoading] = useState<'accept' | 'reject' | null>(null);

    const handleAccept = async () => {
        if (onAccept) {
            setActionLoading('accept');
            try {
                await onAccept();
            } finally {
                setActionLoading(null);
            }
        }
    };

    const handleReject = async () => {
        if (onReject) {
            setActionLoading('reject');
            try {
                await onReject();
            } finally {
                setActionLoading(null);
            }
        }
    };

    const formatDeadline = (dateStr: string) => {
        try {
            return format(new Date(dateStr), 'MMM d, yyyy');
        } catch {
            return dateStr;
        }
    };

    const getStatusBadge = () => {
        switch (offer.status) {
            case 'accepted':
                return (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Accepted
                    </div>
                );
            case 'rejected':
                return (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-100 text-red-600 text-xs font-bold">
                        <span className="material-symbols-outlined text-sm">cancel</span>
                        Declined
                    </div>
                );
            default:
                return (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold animate-pulse">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        Pending
                    </div>
                );
        }
    };

    return (
        <MotionDiv
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-md mx-auto my-4"
        >
            <div className="bg-white rounded-2xl shadow-lg border border-border-subtle overflow-hidden">
                {/* Header */}
                <div className={`bg-gradient-to-r ${offer.orderId ? 'from-purple-600 to-indigo-600' : 'from-primary to-orange-500'} px-5 py-4 text-white`}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined">{offer.orderId ? 'edit_note' : 'description'}</span>
                            <span className="text-sm font-bold uppercase tracking-wide">{offer.orderId ? 'Update Request' : 'Project Offer'}</span>
                        </div>
                        {getStatusBadge()}
                    </div>
                    <h3 className="text-lg font-bold line-clamp-2">{offer.title}</h3>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                    {/* Description */}
                    <div className="min-h-[60px]">
                        {offer.description ? (
                            <div>
                                <p className="text-[10px] text-text-muted uppercase tracking-wide font-bold mb-1.5 flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[14px]">format_align_left</span>
                                    Description
                                </p>
                                <p className="text-[15px] text-text-dark leading-relaxed whitespace-pre-wrap">{offer.description}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-text-muted italic">No additional details provided.</p>
                        )}
                    </div>

                    {/* Deadline & Budget */}
                    <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
                        <div>
                            <p className="text-[10px] text-text-muted uppercase tracking-wide font-bold mb-1">Deadline</p>
                            <div className="flex items-center gap-1.5 text-red-600">
                                <span className="material-symbols-outlined text-lg">event</span>
                                <span className="font-bold">{formatDeadline(offer.deadline)}</span>
                            </div>
                        </div>
                        {offer.budget > 0 && (
                            <div className="text-right">
                                <p className="text-[10px] text-text-muted uppercase tracking-wide font-bold mb-1">Budget</p>
                                <p className="text-2xl font-extrabold text-primary">₹{offer.budget.toLocaleString()}</p>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons (only for receiver and pending offers) */}
                    {!isOwn && offer.status === 'pending' && (
                        <div className="flex gap-3 pt-3">
                            <button
                                onClick={handleReject}
                                disabled={isLoading || actionLoading !== null}
                                className="flex-1 py-3 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                {actionLoading === 'reject' ? (
                                    <span className="material-symbols-outlined animate-spin">refresh</span>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">close</span>
                                        Decline
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleAccept}
                                disabled={isLoading || actionLoading !== null}
                                className="flex-1 py-3 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-2"
                            >
                                {actionLoading === 'accept' ? (
                                    <span className="material-symbols-outlined animate-spin">refresh</span>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">check</span>
                                        Accept
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Status Messages */}
                    {offer.status === 'accepted' && (
                        <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-green-600">celebration</span>
                            <p className="text-sm text-green-700 font-medium">
                                {isOwn ? 'Your offer was accepted!' : 'You accepted this offer!'}
                            </p>
                        </div>
                    )}

                    {offer.status === 'rejected' && (
                        <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-red-500">info</span>
                            <p className="text-sm text-red-600 font-medium">
                                {isOwn ? 'Your offer was declined.' : 'You declined this offer.'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {timestamp && (
                    <div className="px-5 py-2 bg-secondary-bg border-t border-border-subtle">
                        <p className="text-[10px] text-text-muted text-center">
                            Sent {format(new Date(timestamp), 'MMM d, yyyy \'at\' h:mm a')}
                        </p>
                    </div>
                )}
            </div>
        </MotionDiv>
    );
};
