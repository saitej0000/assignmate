import React, { useState, useRef, useEffect } from 'react';
import { FolderPlus, ChevronRight, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from '../ui/Avatar';

interface NewProjectDropdownProps {
    connections: any[];
    onStartProject: (peerId: string) => void;
}

export const NewProjectDropdown: React.FC<NewProjectDropdownProps> = ({ connections, onStartProject }) => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative self-start sm:self-auto" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-primary text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
                <FolderPlus size={18} />
                New Project
                <ChevronRight size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-border-subtle z-50 overflow-hidden"
                    >
                        <div className="p-4 border-b border-border-subtle bg-gray-50/50">
                            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Select Collaborator</h3>
                            <p className="text-[10px] text-text-muted">Choose a connection to start a project with.</p>
                        </div>

                        <div className="max-h-64 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                            {connections.length > 0 ? (
                                connections.map((conn) => (
                                    <button
                                        key={conn.id || conn.objectID}
                                        onClick={() => {
                                            onStartProject(conn.id || conn.objectID);
                                            setIsOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary-bg transition-all group"
                                    >
                                        <Avatar
                                            src={conn.avatar_url}
                                            alt={conn.handle}
                                            className="size-10 rounded-full border border-gray-100"
                                            fallback={conn.handle?.charAt(0)}
                                        />
                                        <div className="flex-1 text-left min-w-0">
                                            <p className="font-bold text-sm text-text-dark truncate group-hover:text-primary transition-colors">
                                                {conn.full_name || conn.handle}
                                            </p>
                                            <p className="text-xs text-text-muted truncate">
                                                @{conn.handle}
                                            </p>
                                        </div>
                                        <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transition-opacity text-xl">
                                            handshake
                                        </span>
                                    </button>
                                ))
                            ) : (
                                <div className="text-center py-6 px-4">
                                    <div className="mx-auto size-10 bg-gray-100 rounded-full flex items-center justify-center mb-2 text-gray-400">
                                        <UserPlus size={20} />
                                    </div>
                                    <p className="text-sm font-bold text-text-dark">No connections yet</p>
                                    <button
                                        onClick={() => navigate('/peers')}
                                        className="text-xs text-primary font-bold mt-2 hover:underline"
                                    >
                                        Find Peers
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
