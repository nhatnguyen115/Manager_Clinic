import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface LoadingProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'primary' | 'white' | 'dark';
    fullPage?: boolean;
    className?: string;
    text?: string;
}

const Loading = ({
    size = 'md',
    variant = 'primary',
    fullPage = false,
    className,
    text,
}: LoadingProps) => {
    const sizeClasses = {
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-2',
        lg: 'h-12 w-12 border-3',
        xl: 'h-16 w-16 border-4',
    };

    const variantClasses = {
        primary: 'border-primary-500 border-t-transparent',
        white: 'border-white border-t-transparent',
        dark: 'border-slate-400 border-t-transparent',
    };

    const spinner = (
        <div className="flex flex-col items-center justify-center gap-3">
            <div
                className={cn(
                    'animate-spin rounded-full',
                    sizeClasses[size],
                    variantClasses[variant],
                    className
                )}
            />
            {text && <p className="text-sm font-medium text-slate-400 animate-pulse">{text}</p>}
        </div>
    );

    if (fullPage) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-fade-in">
                {spinner}
            </div>
        );
    }

    return spinner;
};

export { Loading };
