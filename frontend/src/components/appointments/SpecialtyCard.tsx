import { LucideIcon, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@components/ui/Card';
import { cn } from '@utils';

interface SpecialtyCardProps {
    name: string;
    description: string;
    icon: LucideIcon;
    onClick?: () => void;
    className?: string;
}

export const SpecialtyCard = ({ name, description, icon: Icon, onClick, className }: SpecialtyCardProps) => {
    return (
        <Card
            className={cn(
                "cursor-pointer group transition-all duration-500 hover:border-primary-500/50 hover:shadow-2xl hover:shadow-primary-900/10 active:scale-[0.98] border-slate-800 bg-slate-900/40 backdrop-blur-sm overflow-hidden",
                className
            )}
            onClick={onClick}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <CardContent className="p-8 relative z-10">
                <div className="flex flex-col items-center text-center">
                    <div className="h-20 w-20 bg-slate-800 border border-slate-700/50 rounded-2xl flex items-center justify-center text-primary-400 mb-6 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-primary-900/30 group-hover:border-primary-500/30 group-hover:text-primary-300 transition-all duration-500 ease-out shadow-inner">
                        <Icon size={38} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-50 mb-3 group-hover:text-primary-400 transition-colors tracking-tight">
                        {name}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 group-hover:text-slate-300 transition-colors">
                        {description}
                    </p>

                    <div className="mt-6 flex items-center text-xs font-bold uppercase tracking-widest text-primary-500 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                        Đặt lịch ngay <ArrowRight size={14} className="ml-2" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
