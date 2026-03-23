import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass' | 'dark';
    hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    className = '',
    variant = 'default',
    hoverEffect = false,
    ...props
}) => {

    const variants = {
        default: "card-clean", // Clean white card
        glass: "glass rounded-2xl p-6", // Traditional glass
        dark: "bg-slate-900 border border-slate-800 text-white shadow-lg rounded-2xl"
    };

    const hoverStyles = hoverEffect ? "card-hover" : "";

    return (
        <div
            className={`${variants[variant]} ${hoverStyles} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};
