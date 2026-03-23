import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);

        // Check for chunk load error
        if (error.message.includes('Failed to fetch dynamically imported module') ||
            error.message.includes('Importing a module script failed')) {
            // Prevent infinite reload loops
            const lastReload = sessionStorage.getItem('last_chunk_reload');
            const now = Date.now();

            if (!lastReload || now - parseInt(lastReload) > 10000) {
                // Clear Service Worker to ensure fresh assets
                if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistrations().then((registrations) => {
                        for (const registration of registrations) {
                            registration.unregister();
                        }
                    });
                }

                sessionStorage.setItem('last_chunk_reload', now.toString());
                window.location.reload();
            }
        }
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 text-center">
                    <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-gray-100">
                        <div className="size-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-3xl">⚠️</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-3 font-display">Something went wrong</h1>
                        <p className="text-gray-500 mb-8 leading-relaxed">
                            We encountered an unexpected error. This might be due to a new update.
                        </p>

                        <div className="bg-gray-50 p-4 rounded-xl mb-6 text-left overflow-auto max-h-32 text-xs text-gray-500 font-mono border border-gray-200">
                            {this.state.error?.toString()}
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-3.5 px-6 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={20} />
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
