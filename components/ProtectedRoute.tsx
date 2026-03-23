import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { isProfileComplete } from '../utils/profileValidation';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-orange-600 gap-3">
                <Loader2 className="animate-spin" size={40} />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    // Use unified validation helper - single source of truth
    if (!isProfileComplete(user)) {
        // Don't redirect if already on onboarding page
        if (location.pathname !== '/onboarding') {
            return <Navigate to="/onboarding" replace />;
        }
    }

    return <>{children}</>;
};
