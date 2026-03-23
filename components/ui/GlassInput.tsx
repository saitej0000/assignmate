import React from 'react';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const GlassInput: React.FC<GlassInputProps> = ({
    label,
    error,
    icon,
    className = '',
    id,
    ...props
}) => {
    const inputId = id || React.useId();

    return (
        <div className="w-full space-y-1.5">
            {label && (
                <label htmlFor={inputId} className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                    {label}
                </label>
            )}
            <div className="relative group">
                {icon && (
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                        {icon}
                    </div>
                )}
                <input
                    id={inputId}
                    className={`
            input-mobile
            ${icon ? 'pl-10' : 'pl-4'} 
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''}
            ${className}
          `}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-sm text-red-500 ml-1 font-medium animate-fade-in-up">{error}</p>
            )}
        </div>
    );
};
