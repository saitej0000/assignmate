import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dbService as db } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import { GlassCard } from './ui/GlassCard';
import { GlassButton } from './ui/GlassButton';
import { Loader2, Bot, CheckCircle2 } from 'lucide-react';

export const ProfileBuilder = () => {
    const { user, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Reactive navigation: safely redirect only when user state is updated
    useEffect(() => {
        if (user && !user.is_incomplete) {
            navigate('/feed', { replace: true });
        }
    }, [user, navigate]);

    const handleSkip = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Mark profile as complete and init default fields
            await db.updateProfile(user.id, {
                is_incomplete: false,
                bio_summary: user.bio || '', // Use signup bio
                experience_level: 'Beginner',
                strengths: [],
                weaknesses: [],
                interests: [],
                collaboration_styles: [],
                project_experience: []
            });

            // Trigger a refresh - the useEffect above will handle the nav when it completes
            if (refreshProfile) await refreshProfile();

        } catch (error) {
            console.error("Error skipping onboarding:", error);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                <GlassCard className="p-8 text-center space-y-6">
                    <div className="w-16 h-16 bg-violet-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Bot className="w-8 h-8 text-violet-400" />
                    </div>

                    <h2 className="text-3xl font-bold text-white">
                        AI Profile Builder <span className="text-violet-400">Coming Soon</span>
                    </h2>

                    <p className="text-slate-400 text-lg">
                        We are upgrading our AI systems to provide you with a better onboarding experience.
                        In the meantime, you can skip this step and start using AssignMate immediately.
                    </p>

                    <div className="pt-8">
                        <GlassButton
                            onClick={handleSkip}
                            disabled={loading}
                            className="w-full max-w-sm mx-auto flex items-center justify-center gap-2 py-3"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                            <span>Continue to Dashboard</span>
                        </GlassButton>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};
