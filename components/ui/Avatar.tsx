import React, { useState, useEffect } from 'react';

interface AvatarProps {
    src?: string | null;
    alt?: string;
    className?: string;
    fallback?: string; // Custom fallback text/initials
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt, className = '', fallback }) => {
    const [error, setError] = useState(false);

    // Reset error state if src changes
    useEffect(() => {
        setError(false);
    }, [src]);

    const getInitials = (name?: string) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
    };

    return (
        <div className={`overflow-hidden bg-gray-200 flex items-center justify-center relative rounded-full ${className}`}>
            {src && !error ? (
                <img
                    src={src}
                    alt={alt || 'Avatar'}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={() => setError(true)}
                />
            ) : (
                <span className="font-bold text-gray-500 select-none">
                    {fallback || getInitials(alt)}
                </span>
            )}
        </div>
    );
};
