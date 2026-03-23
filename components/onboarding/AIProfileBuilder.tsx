import React, { useState, useEffect, useRef } from 'react';
import { ai } from '../../services/ai';
import { Send, Loader2, Bot, X, Sparkles, PlusCircle } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

interface AIProfileBuilderProps {
    onComplete: (data: any, bioSummary: string) => void;
    onSkip: () => void;
}

interface Message {
    role: 'user' | 'model';
    parts: { text: string }[];
}

export const AIProfileBuilder: React.FC<AIProfileBuilderProps> = ({ onComplete, onSkip }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const initialized = useRef(false);

    // Initial greeting
    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            // Send empty message to trigger the System Prompt's first greeting
            handleSend("Hello");
        }
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (text: string) => {
        const newHistory = [...messages, { role: 'user' as const, parts: [{ text }] }];
        // Don't show the initial "Hello" trigger if it's the very first one
        if (messages.length > 0) {
            setMessages(newHistory);
        }
        setInput('');
        setLoading(true);

        try {
            const response = await ai.onboardingChat(newHistory);
            let aiText = response.text;

            // Check for JSON object in the response (Final Step)
            const jsonMatch = aiText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    const jsonStr = jsonMatch[0];
                    const profileData = JSON.parse(jsonStr);

                    // Clean the text to remove the JSON for display
                    aiText = aiText.replace(jsonStr, '').trim();

                    setMessages(prev => [...prev, { role: 'model', parts: [{ text: aiText || "Profile generated successfully!" }] }]);

                    // Construct a bio summary
                    const bio = `I am interested in ${profileData.interests?.join(', ') || 'various subjects'}. My strengths include ${profileData.strengths?.join(', ') || 'learning new things'}.`;

                    // Delay slightly then complete
                    setTimeout(() => {
                        onComplete(profileData, bio);
                    }, 2500);
                    return;
                } catch (e) {
                    console.error("Failed to parse AI JSON", e);
                }
            }

            setMessages(prev => [...prev, { role: 'model', parts: [{ text: aiText }] }]);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 relative font-display">
            {/* Background Glow (Local to this component if needed, or inherited from Onboarding) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/20 dark:bg-orange-500/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

            <div className="w-full max-w-3xl bg-white dark:bg-[#171717] rounded-2xl shadow-2xl dark:shadow-glow border border-gray-200 dark:border-[#262626] flex flex-col h-[700px] relative overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-[#262626] flex items-center justify-between bg-white/80 dark:bg-[#171717]/80 backdrop-blur-md z-10">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-gradient-to-br from-orange-500/20 to-transparent rounded-lg flex items-center justify-center border border-orange-500/20">
                            <Sparkles className="text-orange-500 text-xl" size={20} />
                        </div>
                        <div>
                            <h2 className="text-gray-900 dark:text-white font-bold text-lg leading-tight">AssignMate AI</h2>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Profile Assistant Online</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onSkip}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 transition-colors"
                        title="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-gray-50/50 dark:bg-black/20" ref={scrollRef}>
                    {messages.length === 0 && loading && (
                        <div className="flex justify-center items-center h-full opacity-0 animate-fade-in">
                            <div className="flex flex-col items-center gap-3 text-gray-400">
                                <Loader2 size={32} className="animate-spin text-orange-500" />
                                <p className="text-sm font-medium">Initializing...</p>
                            </div>
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                            <div className={`flex items-start gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>

                                {/* Avatar */}
                                {msg.role !== 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-white dark:bg-[#262626] border border-gray-200 dark:border-[#262626] flex items-center justify-center flex-shrink-0 shadow-sm">
                                        <Bot size={16} className="text-orange-500" />
                                    </div>
                                )}

                                <div className="flex flex-col gap-1">
                                    <div className={`p-4 text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                            ? 'bg-orange-500 text-white rounded-2xl rounded-tr-none'
                                            : 'bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-[#262626] text-gray-800 dark:text-gray-200 rounded-2xl rounded-tl-none'
                                        }`}>
                                        <p>{msg.parts[0].text}</p>
                                    </div>
                                    <span className="text-[10px] text-gray-400 ml-1">
                                        {idx === messages.length - 1 ? 'Just now' : ''}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {loading && messages.length > 0 && (
                        <div className="flex items-start gap-4 max-w-[85%] animate-fade-in">
                            <div className="w-8 h-8 rounded-full bg-white dark:bg-[#262626] border border-gray-200 dark:border-[#262626] flex items-center justify-center flex-shrink-0 shadow-sm">
                                <Bot size={16} className="text-orange-500" />
                            </div>
                            <div className="bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-[#262626] p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Input Area */}
                <div className="p-4 bg-white dark:bg-[#171717] border-t border-gray-200 dark:border-[#262626]">
                    <form
                        onSubmit={(e) => { e.preventDefault(); if (input.trim()) handleSend(input); }}
                        className="relative flex items-end gap-2 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] rounded-xl p-2 focus-within:ring-2 focus-within:ring-orange-500/50 focus-within:border-orange-500 transition-all shadow-inner"
                    >
                        <button type="button" className="p-2 text-gray-400 hover:text-orange-500 transition-colors flex-shrink-0" title="Upload Attachment">
                            <PlusCircle size={20} />
                        </button>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    if (input.trim()) handleSend(input);
                                }
                            }}
                            className="w-full bg-transparent border-0 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:ring-0 resize-none py-2.5 max-h-32 scrollbar-none text-sm outline-none"
                            placeholder="Type your answer..."
                            rows={1}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || loading}
                            className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all shadow-lg shadow-orange-500/30 flex-shrink-0 group disabled:opacity-50 disabled:shadow-none"
                        >
                            <Send size={18} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </form>
                    <div className="mt-3 flex items-center justify-center gap-1.5 opacity-60">
                        <Sparkles size={12} className="text-gray-500" />
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Powered by Gemini AI • Responses may vary</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
