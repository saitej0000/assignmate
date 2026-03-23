import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface AdminRouteProps {
    children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
                <Loader2 className="animate-spin text-orange-500 w-8 h-8" />
            </div>
        );
    }

    // Check if user is logged in AND has admin role
    if (!user || user.role !== 'admin') {
        // Redirect to home, but save the location they were trying to go to
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};
