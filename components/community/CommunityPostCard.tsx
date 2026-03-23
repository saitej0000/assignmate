import React, { useState } from 'react';
import { shareContent } from '../../utils/share';
import { useAuth } from '@/contexts/AuthContext';
import { CommunityPost, Comment } from '@/types';
import { Avatar } from '../ui/Avatar';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageSquare, Share2, MoreHorizontal, CheckCircle, Trash2, Send, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dbService as db } from '@/services/firestoreService';
import { useToast } from '@/contexts/ToastContext';

interface CommunityPostCardProps {
    post: CommunityPost;
    onLike: (id: string) => void;
    onDelete: (id: string) => void;
}

export const CommunityPostCard: React.FC<CommunityPostCardProps> = ({ post, onLike, onDelete }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [expanded, setExpanded] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [postingComment, setPostingComment] = useState(false);
    const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
    const [localCommentsCount, setLocalCommentsCount] = useState(post.comments_count || 0);

    const isLiked = post.likes?.includes(user?.id || '');
    const isLongPost = post.content.length > 280;
    const displayContent = expanded || !isLongPost ? post.content : post.content.slice(0, 280) + '...';
    const isOwner = user?.id === post.user_id;

    const [showMenu, setShowMenu] = useState(false);

    const handleProfileClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (post.user_id) {
            navigate(`/profile/${post.user_id}`);
        }
    };

    const handleDeletePost = async () => {
        if (!user || !isOwner) return;
        if (!window.confirm("Are you sure you want to delete this post?")) return;

        try {
            await db.deleteCommunityPost(post.id, user.id);
            onDelete(post.id);
            toast("Post deleted", 'success');
        } catch (error) {
            console.error("Failed to delete post:", error);
            toast("Failed to delete post", 'error');
        }
    };

    const fetchComments = async () => {
        if (!showComments && comments.length === 0) {
            setLoadingComments(true);
            try {
                const fetched = await db.getComments(post.id);
                setComments(fetched as Comment[]);
            } catch (error) {
                console.error("Error loading comments:", error);
            } finally {
                setLoadingComments(false);
            }
        }
        setShowComments(!showComments);
    };

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !commentText.trim()) return;

        setPostingComment(true);
        try {
            const newComment = await db.addComment(
                post.id,
                user,
                commentText.trim(),
                replyingTo?.id,
                replyingTo?.user_handle
            );
            setComments(prev => [...prev, newComment as Comment]);
            setCommentText('');
            setReplyingTo(null);
            setLocalCommentsCount(prev => prev + 1);
        } catch (error) {
            console.error("Failed to post comment:", error);
            toast("Failed to post comment", 'error');
        } finally {
            setPostingComment(false);
        }
    };

    const handleReplyClick = (comment: Comment) => {
        setReplyingTo(comment);
        // Clean off previous text? No, maybe they typed something. 
        // Just focus input (optional but good UX)
        // Ideally we scroll to input, but it's likely visible.
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!user) return;
        if (!window.confirm("Delete this comment?")) return;

        try {
            await db.deleteComment(post.id, commentId, user.id);
            setComments(prev => prev.filter(c => c.id !== commentId));
            setLocalCommentsCount(prev => prev - 1);
            toast("Comment deleted", 'success');
        } catch (error) {
            console.error("Failed to delete comment:", error);
            toast("Failed to delete comment", 'error');
        }
    };

    return (
        <div id={post.id} className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group">
            {/* Header */}
            <div className="flex items-start justify-between mb-4 relative">
                <div
                    className="flex items-center gap-3 cursor-pointer group/profile"
                    onClick={handleProfileClick}
                >
                    <Avatar
                        src={post.user_avatar}
                        alt={post.user_handle}
                        className="size-12 rounded-full border border-gray-100 group-hover/profile:border-orange-200 transition-colors"
                        fallback={post.user_handle?.charAt(0)}
                    />
                    <div>
                        <div className="flex items-center gap-1.5">
                            <h3 className="text-base font-bold text-slate-900 leading-none group-hover/profile:text-orange-600 transition-colors">
                                {post.user_handle}
                            </h3>
                            {/* Verified Badge Mock */}
                            <CheckCircle size={16} className="text-blue-500" fill="currentColor" color="white" />
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-semibold text-slate-500 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-200">
                                {post.user_school || 'Student'}
                            </span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-slate-400">
                                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                            </span>
                        </div>
                    </div>
                </div>

                {isOwner && (
                    <div className="relative">
                        <button
                            className="text-gray-300 hover:text-gray-600 transition-colors p-1"
                            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                        >
                            <MoreHorizontal size={20} />
                        </button>
                        {showMenu && (
                            <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[120px] z-10 animate-in fade-in zoom-in-95 duration-200">
                                <button
                                    onClick={() => { setShowMenu(false); handleDeletePost(); }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                                >
                                    <Trash2 size={16} />
                                    Delete
                                </button>
                            </div>
                        )}
                        {/* Click outside closer could be added here */}
                        {showMenu && (
                            <div className="fixed inset-0 z-0 cursor-default" onClick={() => setShowMenu(false)}></div>
                        )}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className={`prose prose-sm max-w-none mb-4 ${!expanded ? 'cursor-pointer' : ''}`} onClick={() => !expanded && setExpanded(true)}>
                <p className="text-[15px] text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
                    {displayContent}
                    {isLongPost && !expanded && (
                        <span className="text-orange-500 font-bold hover:underline ml-1">
                            Read more
                        </span>
                    )}
                </p>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-4">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => onLike(post.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${isLiked
                            ? 'bg-red-50 text-red-500'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                            }`}
                    >
                        <Heart size={20} fill={isLiked ? "currentColor" : "none"} className={isLiked ? "scale-110" : ""} />
                        <span className="text-sm font-bold">{post.likes?.length || 0} Helpful</span>
                    </button>

                    <button
                        onClick={fetchComments}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${showComments ? 'bg-orange-50 text-orange-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
                    >
                        <MessageSquare size={20} className={showComments ? "fill-current" : ""} />
                        <span className="text-sm font-bold">{localCommentsCount} Replies</span>
                    </button>
                </div>

                <button
                    onClick={() => {
                        shareContent(
                            `Discussion by ${post.user_handle}`,
                            post.content,
                            `${window.location.origin}/community#${post.id}`
                        ).then(res => res === 'copied' && toast('Link copied to clipboard', 'success'));
                    }}
                    className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-50 transition-all"
                >
                    <Share2 size={20} />
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="mt-6 pt-6 border-t border-gray-100 animate-in slide-in-from-top-2">
                    {/* Replying Status */}
                    {replyingTo && (
                        <div className="flex items-center justify-between bg-orange-50 px-4 py-2 rounded-t-xl text-sm border-b border-orange-100/50">
                            <span className="text-orange-700 font-medium">Replying to <span className="font-bold">@{replyingTo.user_handle}</span></span>
                            <button
                                onClick={() => setReplyingTo(null)}
                                className="text-orange-400 hover:text-orange-600 font-bold px-2"
                            >
                                Cancel
                            </button>
                        </div>
                    )}

                    {/* Add Comment Input */}
                    <form onSubmit={handlePostComment} className={`flex gap-3 mb-6 ${replyingTo ? 'bg-orange-50/30 p-2 rounded-b-xl rounded-tr-xl' : ''}`}>
                        <Avatar
                            src={user?.avatar_url}
                            alt={user?.handle}
                            fallback={user?.full_name?.charAt(0)}
                            className="size-8 mt-1"
                        />
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder={replyingTo ? `Reply to ${replyingTo.user_handle}...` : "Write a reply..."}
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 pr-12 text-sm focus:ring-2 focus:ring-orange-100 focus:bg-white transition-all"
                                autoFocus={!!replyingTo}
                            />
                            <button
                                type="submit"
                                disabled={!commentText.trim() || postingComment}
                                className="absolute right-2 top-1.5 p-1.5 text-orange-500 hover:bg-orange-50 rounded-lg disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                            >
                                {postingComment ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            </button>
                        </div>
                    </form>

                    {/* Comments List */}
                    {
                        loadingComments ? (
                            <div className="flex justify-center py-4">
                                <Loader2 size={24} className="animate-spin text-gray-300" />
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {(() => {
                                    // Thread Organization Logic
                                    const commentMap = new Map(comments.map(c => [c.id, c]));
                                    const roots: Comment[] = [];
                                    const repliesByRoot: Record<string, Comment[]> = {};

                                    const findVizRoot = (c: Comment) => {
                                        let cur = c;
                                        // Trace up until true root or orphaned tip
                                        while (cur.reply_to_id) {
                                            const parent = commentMap.get(cur.reply_to_id);
                                            if (!parent) return cur; // Parent missing, treat as root
                                            cur = parent;
                                        }
                                        return cur;
                                    };

                                    comments.forEach(c => {
                                        if (!c.reply_to_id) {
                                            roots.push(c);
                                            return;
                                        }
                                        const root = findVizRoot(c);
                                        if (root.id === c.id) {
                                            roots.push(c); // Orphan tip treated as root
                                        } else {
                                            if (!repliesByRoot[root.id]) repliesByRoot[root.id] = [];
                                            repliesByRoot[root.id].push(c);
                                        }
                                    });

                                    // Render Helper
                                    const renderCommentItem = (comment: Comment, isReply = false) => (
                                        <div key={comment.id} className={`flex gap-3 group ${isReply ? 'ml-0' : ''}`}>
                                            <div onClick={(e) => { e.stopPropagation(); navigate(`/profile/${comment.user_id}`); }} className="cursor-pointer hover:opacity-80 transition-opacity">
                                                <Avatar
                                                    src={comment.user_avatar}
                                                    alt={comment.user_handle}
                                                    fallback={comment.user_handle?.charAt(0)}
                                                    className={isReply ? "size-6 mt-1" : "size-8"}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className={`bg-gray-50 px-4 py-2 ${isReply ? "rounded-xl" : "rounded-2xl rounded-tl-none"}`}>
                                                    <div className="flex items-center justify-between mb-0.5">
                                                        <span
                                                            onClick={(e) => { e.stopPropagation(); navigate(`/profile/${comment.user_id}`); }}
                                                            className={`font-bold text-slate-900 hover:text-orange-600 hover:underline cursor-pointer transition-colors ${isReply ? "text-xs" : "text-sm"}`}
                                                        >
                                                            {comment.user_handle}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400">
                                                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                    <p className={`text-slate-600 whitespace-pre-wrap leading-relaxed ${isReply ? "text-xs" : "text-sm"}`}>
                                                        {comment.reply_to_handle && (
                                                            <span className="text-orange-500 font-medium mr-1.5">
                                                                @{comment.reply_to_handle}
                                                            </span>
                                                        )}
                                                        {comment.content}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-4 mt-1 px-2">
                                                    <button
                                                        onClick={() => handleReplyClick(comment)}
                                                        className="text-xs font-semibold text-gray-400 hover:text-orange-500 transition-colors"
                                                    >
                                                        Reply
                                                    </button>
                                                    {(user?.id === comment.user_id || isOwner) && (
                                                        <button
                                                            onClick={() => handleDeleteComment(comment.id)}
                                                            className="text-xs font-semibold text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );

                                    if (roots.length === 0) {
                                        return <p className="text-center text-sm text-gray-400 py-2 italic">No replies yet. Be the first!</p>;
                                    }

                                    return roots.map(root => (
                                        <div key={root.id} className="flex flex-col gap-3">
                                            {renderCommentItem(root)}

                                            {/* Render Replies */}
                                            {repliesByRoot[root.id] && repliesByRoot[root.id].length > 0 && (
                                                <div className="flex flex-col gap-3 pl-10 mt-1 relative">
                                                    {/* Optional: Guide Line */}
                                                    <div className="absolute left-4 top-0 bottom-4 w-px bg-gray-100"></div>

                                                    {repliesByRoot[root.id].map(reply => renderCommentItem(reply, true))}
                                                </div>
                                            )}
                                        </div>
                                    ));
                                })()}
                            </div>
                        )
                    }
                </div >
            )}
        </div >
    );
};
