import React from 'react';
import { FolderPlus } from 'lucide-react';

export const EmptyState: React.FC = () => (
    <div className="text-center py-20 bg-white rounded-[2.5rem] border border-border-subtle shadow-card">
        <div className="size-20 bg-gray-50 text-gray-400 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <FolderPlus size={40} />
        </div>
        <h3 className="text-xl font-bold text-text-dark">No active projects</h3>
        <p className="text-text-muted text-sm mt-2 max-w-sm mx-auto">
            You don't have any ongoing projects. Start a new collaboration or find a mentor to get started.
        </p>
    </div>
);
