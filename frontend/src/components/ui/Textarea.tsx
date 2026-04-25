import { TextareaHTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
    fullWidth?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, label, error, helperText, fullWidth, id, ...props }, ref) => {
        const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

        return (
            <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
                {label && (
                    <label
                        htmlFor={textareaId}
                        className="text-sm font-medium text-slate-100"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    <textarea
                        id={textareaId}
                        ref={ref}
                        className={cn(
                            'flex min-h-[100px] w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-50 ring-offset-slate-950 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150',
                            error && 'border-error focus-visible:ring-error',
                            className
                        )}
                        {...props}
                    />
                </div>
                {(error || helperText) && (
                    <p
                        className={cn(
                            'text-xs mt-0.5',
                            error ? 'text-error' : 'text-slate-400'
                        )}
                    >
                        {error || helperText}
                    </p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

export { Textarea };
