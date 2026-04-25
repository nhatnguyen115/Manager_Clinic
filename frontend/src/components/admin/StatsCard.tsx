import React from 'react';

interface StatsCardProps {
    icon: React.ReactNode;
    label: string;
    value: number | string;
    trend?: {
        value: string;
        isUp: boolean;
    };
    sublabel?: string;
    bgColor?: string;
    borderColor?: string;
    iconColor?: string;
}

const StatsCard = ({
    icon,
    label,
    value,
    trend,
    sublabel,
    bgColor = "bg-primary-900/20",
    borderColor = "border-primary-700/30",
    iconColor = "text-primary-400"
}: StatsCardProps) => {
    return (
        <div className={`${bgColor} border ${borderColor} rounded-xl p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary-900/10`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-slate-900/50 flex items-center justify-center">
                        <div className={iconColor}>{icon}</div>
                    </div>
                    <span className="text-sm font-medium text-slate-300">{label}</span>
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend.isUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-error/10 text-error'}`}>
                        {trend.isUp ? '↑' : '↓'} {trend.value}
                    </div>
                )}
            </div>
            <p className="text-3xl font-bold text-slate-50">{value}</p>
            {sublabel && (
                <p className="text-xs text-slate-500 mt-1">{sublabel}</p>
            )}
        </div>
    );
};

export default StatsCard;
