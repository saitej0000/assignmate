import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Send, Star } from 'lucide-react';
import { Avatar } from '../ui/Avatar';

interface PostComposerProps {
    onPost: (content: string, scope: 'global' | 'campus') => Promise<void>;
    posting: boolean;
}

const QUICK_PROMPTS = [
    { label: "📚 Academic Help", text: "[Academic Help] I'm stuck on... " },
    { label: "🤝 Find Teammates", text: "[Teammates] Looking for a partner for... " },
    { label: "🚀 Project Idea", text: "[Project Idea] What do you think about... " },
    { label: "📢 Campus News", text: "[Campus News] Did you hear about... " },
];

export const PostComposer: React.FC<PostComposerProps> = ({ onPost, posting }) => {
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [scope, setScope] = useState<'global' | 'campus'>('campus');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || posting) return;
        await onPost(content, scope);
        setContent('');
    };

    const handleChipClick = (text: string) => {
        setContent(prev => text + prev);
    };

    return (
        <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm mb-8 transition-all hover:shadow-md">
            <form onSubmit={handleSubmit}>
                <div className="flex gap-4">
                    <Avatar
                        src={user?.avatar_url}
                        alt={user?.handle}
                        className="size-12 rounded-full border-2 border-gray-50"
                        fallback={user?.full_name?.charAt(0)}
                    />
                    <div className="flex-1">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Ask a doubt, share a project idea, or find a hackathon team..."
                            className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-orange-100 focus:bg-white transition-all text-base resize-none min-h-[100px] placeholder:text-gray-400"
                        />

                        {/* Smart Prompts Chips */}
                        {content.length === 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {QUICK_PROMPTS.map((prompt) => (
                                    <button
                                        key={prompt.label}
                                        type="button"
                                        onClick={() => handleChipClick(prompt.text)}
                                        className="text-xs font-bold px-3 py-1.5 rounded-full bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors border border-orange-100 flex items-center gap-1"
                                    >
                                        <Star size={12} className="text-orange-500" />
                                        {prompt.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 font-medium hidden sm:inline">Post to:</span>
                                <select
                                    value={scope}
                                    onChange={(e) => setScope(e.target.value as 'global' | 'campus')}
                                    className="text-xs font-bold bg-gray-50 border-gray-200 rounded-lg py-1.5 px-2 focus:ring-orange-500 focus:border-orange-500 text-gray-700"
                                >
                                    <option value="campus">My Campus</option>
                                    <option value="global">Global Network</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={!content.trim() || posting}
                                className="bg-[#FF6B4A] text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-lg hover:shadow-orange-200 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:shadow-none disabled:translate-y-0 flex items-center gap-2"
                            >
                                {posting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                Post Discussion
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};
