import { HTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
    src?: string;
    alt?: string;
    fallback?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
    ({ className, src, alt, fallback, size = 'md', ...props }, ref) => {
        const sizeClasses = {
            xs: 'h-6 w-6 text-[10px]',
            sm: 'h-8 w-8 text-xs',
            md: 'h-10 w-10 text-sm',
            lg: 'h-12 w-12 text-base',
            xl: 'h-16 w-16 text-xl',
            xxl: 'h-32 w-32 text-4xl',
        };

        return (
            <div
                ref={ref}
                className={cn(
                    'relative flex shrink-0 overflow-hidden rounded-full bg-slate-800 border-2 border-slate-700',
                    sizeClasses[size],
                    className
                )}
                {...props}
            >
                {src ? (
                    <img
                        src={src}
                        alt={alt || 'Avatar'}
                        className="absolute inset-0 z-10 h-full w-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                ) : null}

                {/* Fallback initials if image fails or no src */}
                <div className="absolute inset-0 flex h-full w-full items-center justify-center font-semibold uppercase text-slate-300 bg-slate-800">
                    {fallback?.substring(0, 2) || (alt?.substring(0, 1) || '?')}
                </div>
            </div>
        );
    }
);

Avatar.displayName = 'Avatar';

export { Avatar };
