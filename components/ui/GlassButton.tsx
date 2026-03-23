import React from 'react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    icon?: React.ReactNode;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
    children,
    className = '',
    variant = 'primary',
    size = 'md',
    isLoading = false,
    icon,
    disabled,
    ...props
}) => {
    // Base styles are handled by .btn utility in index.css

    const variants = {
        primary: "btn-primary",
        secondary: "btn-secondary",
        ghost: "btn-ghost",
        outline: "border-2 border-orange-500 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30"
    };

    const sizes = {
        sm: "px-4 py-2.5 text-sm touch-target",      // min 44px
        md: "px-6 py-3 text-base touch-target",      // comfortable tap
        lg: "px-8 py-4 text-lg touch-target-lg"      // large tap target
    };

    return (
        <button
            className={`btn ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {!isLoading && icon && <span className="mr-2">{icon}</span>}
            {children}
        </button>
    );
};
