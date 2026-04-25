import { Modal } from './Modal';
import { Button } from './Button';
import { LucideIcon, AlertTriangle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge tailwind classes
 */
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info' | 'success';
    icon?: LucideIcon;
    isLoading?: boolean;
}

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    variant = 'danger',
    icon: Icon = AlertTriangle,
    isLoading = false
}: ConfirmationModalProps) => {

    const variantStyles = {
        danger: 'bg-error-900/20 text-error-500 border-error-500/20',
        warning: 'bg-warning-900/20 text-warning-500 border-warning-500/20',
        info: 'bg-primary-900/20 text-primary-500 border-primary-500/20',
        success: 'bg-emerald-900/20 text-emerald-500 border-emerald-500/20',
    };

    // Based on common project style, checking if we need specific button variants.
    // Let's assume Button has 'primary', 'outline', 'ghost', 'error', etc.

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="sm"
            className="!p-0"
        >
            <div className="p-6">
                <div className="flex flex-col items-center text-center">
                    <div className={cn(
                        "h-16 w-16 rounded-full border flex items-center justify-center mb-4 animate-in zoom-in duration-300",
                        variantStyles[variant]
                    )}>
                        <Icon size={32} />
                    </div>

                    <h3 className="text-xl font-bold text-slate-50 mb-2">{title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        {message}
                    </p>
                </div>

                <div className="flex flex-col gap-2 mt-8">
                    <Button
                        variant={variant === 'danger' ? 'danger' : 'primary'}
                        className="w-full h-11"
                        onClick={onConfirm}
                        isLoading={isLoading}
                    >
                        {confirmText}
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full text-slate-400 hover:text-slate-100 h-11"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export { ConfirmationModal };
