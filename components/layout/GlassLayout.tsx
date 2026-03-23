import React from 'react';
import { cn } from '../../utils/cn';

interface GlassLayoutProps {
    children: React.ReactNode;
    className?: string;
    showBlobs?: boolean;
}

export const GlassLayout: React.FC<GlassLayoutProps> = ({
    children,
    className,
    showBlobs = true
}) => {
    return (
        <div className="min-h-screen w-full relative overflow-x-hidden bg-[#faf9f7] dark:bg-slate-950 transition-colors duration-300">
            {/* Background Blobs Removed */}
            {showBlobs && (
                <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                    {/* Blobs removed to ensure clean background */}
                </div>
            )}

            {/* Content */}
            <div className={cn("relative z-10", className)}>
                {children}
            </div>
        </div>
    );
};
