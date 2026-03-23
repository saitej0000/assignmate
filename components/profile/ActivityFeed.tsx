import React, { useEffect, useState } from 'react';
import { dbService as db } from '../../services/firestoreService';
import { CommunityPost } from '../../types';
import { CommunityPostCard } from '../community/CommunityPostCard';
import { Loader2, MessageSquare } from 'lucide-react';

interface ActivityFeedProps {
    userId: string;
    userSchool: string;
    viewerSchool?: string;
}

export const ActivityFeed = ({ userId, userSchool, viewerSchool }: ActivityFeedProps) => {
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const data = await db.getUserPosts(userId);
                setPosts(data);
            } catch (error) {
                console.error("Failed to fetch user posts:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [userId]);

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    // Visibility Logic
    const canSeeCampus = viewerSchool === userSchool;
    const visiblePosts = posts.filter(p => p.scope === 'global' || canSeeCampus);

    if (visiblePosts.length === 0) {
        return (
            <div className="bg-white rounded-3xl p-12 shadow-soft border border-border-light text-center">
                <div className="inline-flex items-center justify-center size-16 rounded-full bg-gray-50 text-gray-400 mb-4">
                    <MessageSquare size={32} />
                </div>
                <h3 className="text-lg font-bold text-text-main mb-1">No Activity Yet</h3>
                <p className="text-secondary text-sm">
                    This user hasn't posted in the community yet.
                </p>

                {/* Stats for "Joined" and "Active" can stay here if desired, 
                     but the main focus is the empty post feed. */}
                <div className="pt-6 flex justify-center gap-2 opacity-50">
                    <div className="px-4 py-2 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center">
                        <span className="text-[10px] font-bold text-secondary uppercase">Joined</span>
                        <span className="font-bold text-text-main text-sm">Recent</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {visiblePosts.map(post => (
                <CommunityPostCard
                    key={post.id}
                    post={post}
                    onLike={() => { }}
                    onDelete={() => { }}
                />
            ))}
        </div>
    );
};
