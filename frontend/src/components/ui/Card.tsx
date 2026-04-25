import { ReactNode, HTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    hoverable?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, hoverable, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'bg-slate-900 border border-slate-700 rounded-xl overflow-hidden transition-all duration-300',
                    hoverable && 'hover:border-primary-700/50 hover:shadow-lg hover:shadow-primary-900/10',
                    className
                )}
                {...props}
            />
        );
    }
);

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
    title?: string;
    description?: string;
    icon?: ReactNode;
    action?: ReactNode;
}

const CardHeader = ({ className, title, description, icon, action, children, ...props }: CardHeaderProps) => (
    <div className={cn('px-6 py-4 border-b border-slate-700 flex items-start justify-between gap-4', className)} {...props}>
        <div className="flex items-start gap-4 flex-1">
            {icon && <div className="mt-1 text-primary-500 shrink-0">{icon}</div>}
            {(title || description) && (
                <div className="flex flex-col gap-1">
                    {title && <h3 className="text-lg font-semibold text-slate-50">{title}</h3>}
                    {description && <p className="text-sm text-slate-400">{description}</p>}
                </div>
            )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
        {children}
    </div>
);

const CardContent = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('px-6 py-4', className)} {...props} />
);

const CardTitle = ({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className={cn('text-lg font-semibold text-slate-50', className)} {...props} />
);

const CardFooter = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('px-6 py-4 border-t border-slate-700 bg-slate-950/30 font-medium', className)} {...props} />
);

Card.displayName = 'Card';

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
