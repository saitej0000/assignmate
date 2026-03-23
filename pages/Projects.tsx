import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { MobileNav } from '../components/dashboard/MobileNav';
import { useAuth } from '../contexts/AuthContext';
import { dbService as db } from '../services/firestoreService';
import { Loader2, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProjectCard } from '../components/projects/ProjectCard';
import { NewProjectDropdown } from '../components/projects/NewProjectDropdown';
import { EmptyState } from '../components/projects/EmptyState';

export const Projects: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<any[]>([]);
    const [connections, setConnections] = useState<any[]>([]);

    const loadData = async () => {
        if (!user) return;
        try {
            const [stats, conns] = await Promise.all([
                db.getDashboardStats(user.id),
                db.getMyConnections(user.id)
            ]);
            setProjects(stats.activeOrders || []);

            // Process connections to get the "other" user details
            const processedConns = conns.map((c: any) => {
                // Start by looking for the "other" user in participants list
                if (c.participants && Array.isArray(c.participants)) {
                    const otherUser = c.participants.find((p: any) => (p.id || p) !== user.id);
                    if (otherUser && typeof otherUser === 'object') return otherUser; // Already populated
                }
                // Fallback if structure varies
                return c;
            }).filter(Boolean);

            setConnections(processedConns);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [user]);

    const handleStartProject = async (peerId: string) => {
        if (!user) return;
        try {
            // Find existing chat or create new one
            let chatId = await db.findExistingChat(user.id, peerId);
            if (!chatId) {
                const newChat = await db.createChat(null, user.id, peerId);
                chatId = newChat.id;
            }
            // Navigate with state to auto-open Collaborate modal
            navigate(`/chats/${chatId}`, { state: { openCollaborate: true } });
        } catch (err) {
            console.error("Error starting project flow:", err);
            alert("Failed to open chat. Please try again.");
        }
    };

    return (
        <div className="bg-background text-text-dark antialiased h-screen overflow-hidden flex selection:bg-primary/20 font-display">
            <Sidebar user={user} />

            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <DashboardHeader />

                <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-4 pb-20">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-2xl font-extrabold text-text-dark tracking-tight">My Projects</h1>
                                <p className="text-text-muted text-sm mt-1">Manage and track your ongoing academic collaborations.</p>
                            </div>

                            <NewProjectDropdown
                                connections={connections}
                                onStartProject={handleStartProject}
                            />
                        </div>

                        {/* Filters & Search */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search projects..."
                                    className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-border-subtle focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium outline-none"
                                />
                            </div>
                            <button className="bg-white px-4 py-3 rounded-2xl border border-border-subtle text-text-muted hover:text-primary transition-colors flex items-center gap-2 text-sm font-bold">
                                <Filter size={18} />
                                Filters
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="animate-spin text-primary" size={32} />
                            </div>
                        ) : projects.length === 0 ? (
                            <EmptyState />
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {projects.map((project) => (
                                    <ProjectCard
                                        key={project.id}
                                        project={project}
                                        onUpdate={loadData}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <MobileNav />
        </div>
    );
};
