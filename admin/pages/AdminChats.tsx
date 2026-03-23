import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminService';
import { GlassCard } from '../../components/ui/GlassCard';
import { Search, MessageCircle, Eye, Trash2 } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export const AdminChats = () => {
    const [chats, setChats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedChat, setSelectedChat] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);

    useEffect(() => {
        loadChats();
    }, []);

    useEffect(() => {
        if (selectedChat) {
            loadMessages(selectedChat);
        }
    }, [selectedChat]);

    const loadChats = async () => {
        try {
            const data = await adminApi.getAllChats();
            setChats(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (chatId: string) => {
        const msgs = await adminApi.getChatMessages(chatId);
        setMessages(msgs);
    };

    const { success, error } = useToast();

    const handleDeleteMessage = async (msgId: string) => {
        if (!confirm('Delete this message?')) return;
        try {
            await adminApi.deleteMessage(msgId, 'Admin deletion');
            setMessages(messages.filter(m => m.id !== msgId));
            success("Message deleted");
        } catch (e) {
            console.error(e);
            error("Failed to delete message");
        }
    };

    if (loading) return <div className="text-white">Loading Chats...</div>;

    return (
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
            {/* Chat List */}
            <div className="col-span-4 bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-800">
                    <h3 className="font-bold text-white mb-2">Active Rooms</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search rooms..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {chats.map(chat => (
                        <div
                            key={chat.id}
                            onClick={() => setSelectedChat(chat.id)}
                            className={`p-4 border-b border-slate-800 cursor-pointer hover:bg-slate-800/50 transition-colors ${selectedChat === chat.id ? 'bg-slate-800 border-l-2 border-l-red-500' : ''}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-medium text-slate-200 text-sm">
                                    {chat.poster?.handle} & {chat.writer?.handle}
                                </span>
                                <span className="text-xs text-slate-600">
                                    {new Date(chat.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 truncate">{chat.last_message || 'No messages'}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Viewer */}
            <div className="col-span-8 bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
                {selectedChat ? (
                    <>
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                            <h3 className="font-bold text-white">Chat Monitor</h3>
                            <button className="text-xs text-red-500 hover:text-red-400">Flag Conversation</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map(msg => (
                                <div key={msg.id} className="group flex items-start gap-3">
                                    <div className={`flex-1 p-3 rounded-lg ${msg.type === 'SYSTEM' ? 'bg-slate-800 text-center text-xs text-slate-400' : 'bg-slate-950 border border-slate-800'}`}>
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-bold text-slate-500">{msg.sender_id.slice(0, 6)}...</span>
                                            <span className="text-[10px] text-slate-600">
                                                {new Date(msg.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-300">{msg.content}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteMessage(msg.id)}
                                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-red-500 transition-opacity"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                        <MessageCircle size={48} className="mb-4 opacity-20" />
                        <p>Select a chat to monitor</p>
                    </div>
                )}
            </div>
        </div>
    );
};
