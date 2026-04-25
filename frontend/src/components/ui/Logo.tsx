import React from 'react';
import { cn } from '@utils';

interface LogoProps {
    className?: string;
    iconOnly?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className, iconOnly = false, size = 'md' }) => {
    const sizeClasses = {
        sm: 'h-6 w-6',
        md: 'h-8 w-8',
        lg: 'h-10 w-10',
    };

    const textClasses = {
        sm: 'text-lg',
        md: 'text-xl',
        lg: 'text-2xl',
    };

    return (
        <div className={cn('flex items-center gap-2.5 group cursor-pointer', className)}>
            {/* Premium SVG Icon */}
            <div className={cn(
                sizeClasses[size],
                'relative flex items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-900/20 group-hover:shadow-primary-500/30 transition-all duration-300 group-hover:scale-105'
            )}>
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-2/3 h-2/3 text-white"
                >
                    {/* Medical Cross Base */}
                    <path
                        d="M12 4V20M4 12H20"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="opacity-40"
                    />
                    {/* Pulse/Intelligence Line */}
                    <path
                        d="M3 12H7L9 16L13 8L15 12H21"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="drop-shadow-[0_0_3px_rgba(255,255,255,0.8)]"
                    />
                    {/* AI Node Point */}
                    <circle cx="21" cy="12" r="1.5" fill="white" />
                </svg>

                {/* Subtle Glow Effect */}
                <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {!iconOnly && (
                <span className={cn(
                    textClasses[size],
                    'font-bold tracking-tight text-slate-50 transition-colors group-hover:text-white'
                )}>
                    Clinic<span className="text-primary-400 group-hover:text-primary-300">Pro</span>
                </span>
            )}
        </div>
    );
};
