import { Star, MapPin, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Avatar } from '@components/ui/Avatar';
import { cn } from '@utils';

interface DoctorCardProps {
    name: string;
    specialty: string;
    rating: number;
    reviewCount: number;
    location: string;
    avatarSrc?: string;
    onViewReviews?: () => void;
    onClick?: () => void;
    className?: string;
}

export const DoctorCard = ({
    name,
    specialty,
    rating,
    reviewCount,
    location,
    avatarSrc,
    onViewReviews,
    onClick,
    className,
}: DoctorCardProps) => {
    return (
        <Card
            className={cn(
                "group transition-all duration-500 hover:border-primary-500/50 hover:shadow-2xl hover:shadow-primary-900/10 border-slate-800 bg-slate-900/40 backdrop-blur-sm overflow-hidden",
                className
            )}
        >
            <CardContent className="p-6">
                <div className="flex gap-5">
                    <div className="relative shrink-0">
                        <Avatar
                            src={avatarSrc}
                            fallback={name.split(' ').map(n => n[0]).join('')}
                            size="lg"
                            className="w-24 h-24 rounded-2xl border-2 border-slate-700 group-hover:border-primary-500/50 transition-colors duration-500"
                        />
                        <div className="absolute -bottom-2 -right-2 bg-slate-900 border border-slate-700 rounded-lg px-1.5 py-0.5 flex items-center gap-1 shadow-lg">
                            <Star className="text-warning fill-warning" size={12} />
                            <span className="text-[10px] font-bold text-slate-50">{rating.toFixed(1)}</span>
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="text-xl font-bold text-slate-50 truncate group-hover:text-primary-400 transition-colors tracking-tight">
                                {name}
                            </h3>
                        </div>
                        <p className="text-primary-500 text-sm font-bold mb-3 uppercase tracking-wider">{specialty}</p>

                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Đánh giá</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onViewReviews?.();
                                    }}
                                    className="text-slate-100 text-xs font-bold hover:text-primary-400 transition-colors flex items-center gap-1"
                                >
                                    {reviewCount} lượt
                                </button>
                            </div>
                            <div className="w-px h-6 bg-slate-700" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Kinh nghiệm</span>
                                <span className="text-slate-100 text-xs font-bold">10+ năm</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-5 bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
                            <MapPin size={14} className="text-primary-500 shrink-0" />
                            <span className="truncate">{location || 'Bệnh viện Đa khoa Quốc tế'}</span>
                        </div>

                        <Button
                            fullWidth
                            onClick={onClick}
                            className="bg-primary-600 hover:bg-primary-500 text-xs font-bold uppercase tracking-widest h-10 shadow-lg shadow-primary-900/20 group-hover:scale-[1.02] transition-transform"
                        >
                            Đặt lịch khám <ArrowRight size={14} className="ml-2" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
