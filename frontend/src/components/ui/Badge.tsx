import { HTMLAttributes, forwardRef } from 'react';
import { VariantProps, cva } from 'class-variance-authority';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const badgeVariants = cva(
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
    {
        variants: {
            variant: {
                default: 'bg-slate-800 text-slate-50 border border-slate-700',
                primary: 'bg-primary-900/30 text-primary-400 border border-primary-700/30',
                success: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
                error: 'bg-error/10 text-error border border-error/20',
                warning: 'bg-warning/10 text-warning border border-warning/20',
                info: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
            },
            size: {
                sm: 'px-2 py-0.5 text-[10px]',
                md: 'px-2.5 py-0.5 text-xs',
            }
        },
        defaultVariants: {
            variant: 'default',
            size: 'md',
        },
    }
);

export interface BadgeProps
    extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
    ({ className, variant, size, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(badgeVariants({ variant, size }), className)}
                {...props}
            />
        );
    }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
