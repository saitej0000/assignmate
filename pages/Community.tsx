import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { dbService as db } from '../services/firestoreService';
import { CommunityPost } from '../types';
import { Sidebar } from '../components/dashboard/Sidebar';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { MobileNav } from '../components/dashboard/MobileNav';
import { Loader2, Zap } from 'lucide-react';
import { PostComposer } from '../components/community/PostComposer';
import { CommunityPostCard } from '../components/community/CommunityPostCard';

export const Community: React.FC = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);
    const [viewMode, setViewMode] = useState<'global' | 'campus'>('campus'); // Default to Campus

    useEffect(() => {
        if (user) {
            fetchPosts();
        }
    }, [viewMode, user]);

    const fetchPosts = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const collegeFilter = viewMode === 'campus' && user.school ? user.school : undefined;
            const data = await db.getCommunityPosts(collegeFilter);
            setPosts(data as CommunityPost[]);
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async (content: string, scope: 'global' | 'campus') => {
        if (!user) return;
        setPosting(true);
        try {
            const safePostData = {
                user_id: user.id,
                user_handle: (user.handle || user.full_name || 'Anonymous User') ?? 'Anonymous',
                user_avatar: user.avatar_url ?? null,
                user_school: (user.school || 'Unknown University') ?? 'Unknown School',
                content: content.trim() ?? '',
                scope: scope
            };

            const newPost = await db.createCommunityPost(safePostData);
            toast('Discussion started successfully!', 'success');

            // Send Notification (Vercel API)
            fetch('/api/notifications/send-post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    postId: newPost.id,
                    content: safePostData.content,
                    scope: safePostData.scope,
                    userSchool: safePostData.user_school,
                    userSchoolName: safePostData.user_school
                })
            }).catch(err => console.error('Notification failed:', err));

            fetchPosts();
        } catch (error: any) {
            console.error("Failed to share post:", error);
            const errorMessage = error?.message || "Unknown error";
            toast(`Failed to post: ${errorMessage}`, 'error');
        } finally {
            setPosting(false);
        }
    };

    const handleToggleLike = async (postId: string) => {
        if (!user) return;
        try {
            await db.toggleLikePost(postId, user.id);
            setPosts(prev => prev.map(p => {
                if (p.id === postId) {
                    const likes = p.likes || [];
                    const newLikes = likes.includes(user.id)
                        ? likes.filter(id => id !== user.id)
                        : [...likes, user.id];
                    return { ...p, likes: newLikes };
                }
                return p;
            }));
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };

    const handleDeletePost = async (postId: string) => {
        setPosts(prev => prev.filter(p => p.id !== postId));
    };

    return (
        <div className="bg-background text-text-dark antialiased h-screen overflow-hidden flex selection:bg-primary/20 font-display">
            <Sidebar user={user} />

            <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#F9FAFB]">
                <DashboardHeader />

                <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
                    <div className="max-w-3xl mx-auto">

                        {/* A. Page Header */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Campus Discussions</h1>
                                    <p className="text-slate-500 text-base max-w-xl">
                                        Ask academic doubts, find project teammates, and grow with peers from <span className="font-semibold text-slate-700">{user?.school || 'your campus'}</span>.
                                    </p>
                                </div>
                                {/* B. View Toggle */}
                                <div className="hidden md:flex bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
                                    <button
                                        onClick={() => setViewMode('campus')}
                                        className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'campus' ? 'bg-orange-50 text-orange-600 shadow-sm ring-1 ring-orange-100' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        My Campus
                                    </button>
                                    <button
                                        onClick={() => setViewMode('global')}
                                        className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'global' ? 'bg-orange-50 text-orange-600 shadow-sm ring-1 ring-orange-100' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        Global Network
                                    </button>
                                </div>
                            </div>
                            {/* Mobile Toggle */}
                            <div className="flex md:hidden bg-white border border-gray-200 p-1 rounded-xl shadow-sm mt-4 w-full">
                                <button
                                    onClick={() => setViewMode('campus')}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'campus' ? 'bg-orange-50 text-orange-600 shadow-sm ring-1 ring-orange-100' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                                >
                                    My Campus
                                </button>
                                <button
                                    onClick={() => setViewMode('global')}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'global' ? 'bg-orange-50 text-orange-600 shadow-sm ring-1 ring-orange-100' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                                >
                                    Global
                                </button>
                            </div>
                        </div>

                        {/* C. Post Composer */}
                        <PostComposer onPost={handleCreatePost} posting={posting} />

                        {/* D. Feed Cards */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Loader2 className="animate-spin text-orange-500 size-8" />
                                <p className="text-gray-400 font-medium animate-pulse">Finding discussions...</p>
                            </div>
                        ) : posts.length === 0 ? (
                            /* E. Empty State (Zero-to-One) */
                            <div className="text-center py-16 bg-white rounded-[2rem] border border-dashed border-gray-300">
                                <div className="size-20 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-orange-50/50">
                                    <Zap size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">
                                    {viewMode === 'campus' ? `Your campus feed is quiet... for now.` : `No global discussions yet.`}
                                </h3>
                                <p className="text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
                                    Be the leader who starts the conversation! Ask a question about upcoming exams, assignments, or events.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {posts.map((post) => (
                                    <CommunityPostCard
                                        key={post.id}
                                        post={post}
                                        onLike={handleToggleLike}
                                        onDelete={handleDeletePost}
                                    />
                                ))}

                                <div className="text-center py-8">
                                    <p className="text-gray-400 text-sm font-medium">
                                        You've reached the end of the discussions.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <MobileNav />
        </div>
    );
};
