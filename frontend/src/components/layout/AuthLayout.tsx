import { ReactNode } from 'react';
import { Logo } from '@components/ui/Logo';

export const AuthLayout = ({ children, title, subtitle }: { children: ReactNode, title: string, subtitle?: string }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            <div className="w-full max-w-md space-y-8 animate-fade-in">
                <div className="flex flex-col items-center justify-center text-center">
                    <Logo size="lg" className="mb-6" />
                    <h2 className="mt-4 text-xl font-semibold text-slate-50">{title}</h2>
                    {subtitle && <p className="mt-2 text-sm text-slate-400">{subtitle}</p>}
                </div>

                <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-8 shadow-xl shadow-black/20">
                    {children}
                </div>

                <p className="text-center text-xs text-slate-500">
                    &copy; 2026 ClinicPro Modern Management System. All rights reserved.
                </p>
            </div>
        </div>
    );
};
