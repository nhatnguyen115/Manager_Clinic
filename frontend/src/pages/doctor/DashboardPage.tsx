import { useState, useEffect } from 'react';
import {
    Calendar,
    Clock,
    Users,
    Star,
    TrendingUp,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Stethoscope
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { Loading } from '@components/ui/Loading';
import { useAuth } from '@contexts/AuthContext';
import { Link } from 'react-router-dom';
import { getTodayAppointments, getDashboardStats, getDoctorReviews, updateAppointmentStatus } from '@services/doctorService';
import type { AppointmentResponse, AppointmentStatus, DoctorDashboardStats, ReviewResponse } from '@/types';
import { toast } from 'react-hot-toast';

// Status badge variant mapping
const statusVariant: Record<AppointmentStatus, 'primary' | 'success' | 'warning' | 'error' | 'info'> = {
    PENDING: 'warning',
    CONFIRMED: 'primary',
    COMPLETED: 'success',
    CANCELLED: 'error',
    NO_SHOW: 'error',
};

const statusLabel: Record<AppointmentStatus, string> = {
    PENDING: 'Chờ xác nhận',
    CONFIRMED: 'Đã xác nhận',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
    NO_SHOW: 'Không đến',
};

const DoctorDashboardPage = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [todayApts, setTodayApts] = useState<AppointmentResponse[]>([]);
    const [stats, setStats] = useState<DoctorDashboardStats | null>(null);
    const [recentReviews, setRecentReviews] = useState<ReviewResponse[]>([]);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [aptsData, statsData, reviewsData] = await Promise.allSettled([
                getTodayAppointments(),
                getDashboardStats(),
                user?.id ? getDoctorReviews(user.id) : Promise.resolve([]),
            ]);

            if (aptsData.status === 'fulfilled') setTodayApts(aptsData.value);
            if (statsData.status === 'fulfilled') setStats(statsData.value);
            if (reviewsData.status === 'fulfilled') {
                const reviews = reviewsData.value as ReviewResponse[];
                setRecentReviews(reviews.slice(0, 3));
                if (reviews.length > 0 && statsData.status === 'fulfilled') {
                    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
                    setStats(prev => prev ? { ...prev, averageRating: avg } : prev);
                }
            }
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [user]);

    const handleStatusUpdate = async (id: string, newStatus: AppointmentStatus) => {
        try {
            await updateAppointmentStatus(id, newStatus);
            toast.success(`Cập nhật trạng thái thành công: ${statusLabel[newStatus]}`);
            loadData(); // Refresh data
        } catch (error) {
            console.error('Failed to update status:', error);
            toast.error('Không thể cập nhật trạng thái');
        }
    };

    if (isLoading) {
        return <Loading fullPage text="Đang tải dashboard..." />;
    }

    const today = new Date();
    const dateStr = today.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Welcome Section */}
            <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-50 tracking-tight">
                        Xin chào, <span className="text-primary-500">{user?.fullName || 'Doctor'}</span>
                    </h1>
                    <p className="text-slate-400 mt-2 text-lg">
                        {dateStr}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link to="/doctor/calendar">
                        <Button variant="outline" size="sm" className="border-primary-700/50 text-primary-400 hover:bg-primary-900/20">
                            <Calendar size={16} className="mr-2" /> Lịch tuần
                        </Button>
                    </Link>
                    <Link to="/doctor/appointments">
                        <Button size="sm" className="bg-primary-600 hover:bg-primary-500">
                            <Stethoscope size={16} className="mr-2" /> Quản lý lịch hẹn
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        icon={<Calendar className="text-primary-400" size={24} />}
                        label="Hôm nay"
                        value={stats.todayAppointments}
                        sublabel="lịch hẹn"
                        bgColor="bg-primary-900/20"
                        borderColor="border-primary-700/30"
                    />
                    <StatCard
                        icon={<TrendingUp className="text-emerald-400" size={24} />}
                        label="Tuần này"
                        value={stats.weekAppointments}
                        sublabel="lịch hẹn"
                        bgColor="bg-emerald-900/20"
                        borderColor="border-emerald-700/30"
                    />
                    <StatCard
                        icon={<Users className="text-blue-400" size={24} />}
                        label="Bệnh nhân"
                        value={stats.totalPatients}
                        sublabel="tổng cộng"
                        bgColor="bg-blue-900/20"
                        borderColor="border-blue-700/30"
                    />
                    <StatCard
                        icon={<Star className="text-amber-400" size={24} />}
                        label="Đánh giá"
                        value={stats.averageRating.toFixed(1)}
                        sublabel="trung bình"
                        bgColor="bg-amber-900/20"
                        borderColor="border-amber-700/30"
                    />
                </div>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Today's Appointments (spans 2 cols) */}
                <Card className="lg:col-span-2">
                    <CardHeader
                        title="Lịch hẹn hôm nay"
                        description={`${todayApts.length} lịch hẹn`}
                        icon={<Stethoscope size={20} />}
                        action={
                            <Link to="/doctor/appointments">
                                <Button variant="ghost" size="sm" className="text-primary-500">
                                    Xem tất cả <ArrowRight size={16} className="ml-2" />
                                </Button>
                            </Link>
                        }
                    />
                    <CardContent className="space-y-3">
                        {todayApts.length > 0 ? (
                            todayApts.map((apt) => (
                                <div
                                    key={apt.id}
                                    className="flex items-center gap-4 p-4 bg-slate-800/40 rounded-xl border border-slate-700/50 hover:border-primary-700/30 transition-all duration-200"
                                >
                                    {/* Time */}
                                    <div className="flex-shrink-0 text-center min-w-[64px]">
                                        <p className="text-lg font-bold text-primary-400">
                                            {apt.appointmentTime}
                                        </p>
                                    </div>

                                    {/* Divider */}
                                    <div className="w-px h-12 bg-slate-700" />

                                    {/* Patient Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold text-slate-50 truncate">
                                                {apt.patientName}
                                            </h4>
                                            <Badge variant={statusVariant[apt.status]} size="sm">
                                                {statusLabel[apt.status]}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-slate-400 truncate">
                                            {apt.symptoms || 'Chưa có triệu chứng'}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex-shrink-0 flex gap-2">
                                        {apt.status === 'PENDING' && (
                                            <Button
                                                size="sm"
                                                className="bg-primary-600 hover:bg-primary-500"
                                                onClick={() => handleStatusUpdate(apt.id, 'CONFIRMED')}
                                            >
                                                <CheckCircle2 size={14} className="mr-1" /> Xác nhận
                                            </Button>
                                        )}
                                        {apt.status === 'CONFIRMED' && (
                                            <Link to="/doctor/appointments">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                >
                                                    <Clock size={14} className="mr-1" /> Khám
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center">
                                <Calendar size={48} className="mx-auto text-slate-600 mb-3" />
                                <p className="text-slate-400 text-lg">Không có lịch hẹn hôm nay</p>
                                <p className="text-slate-500 text-sm mt-1">Hãy thư giãn hoặc kiểm tra lịch tuần</p>
                                <Link to="/doctor/calendar">
                                    <Button variant="outline" size="sm" className="mt-4 border-slate-600 text-slate-300">
                                        <Calendar size={14} className="mr-2" /> Xem lịch tháng
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Stats + Pending */}
                <div className="space-y-6">
                    {/* Pending Appointments Alert */}
                    {stats && stats.pendingAppointments > 0 && (
                        <Card className="border-warning/30 bg-warning/5">
                            <CardContent className="flex items-center gap-4 py-5">
                                <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center flex-shrink-0">
                                    <AlertCircle className="text-warning" size={24} />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-slate-50">
                                        {stats.pendingAppointments} lịch chờ xác nhận
                                    </p>
                                    <p className="text-sm text-slate-400 mt-0.5">
                                        Cần xác nhận để bệnh nhân biết lịch khám
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Monthly Summary */}
                    {stats && (
                        <Card>
                            <CardHeader title="Tháng này" icon={<TrendingUp size={18} />} />
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 text-sm">Tổng lịch hẹn</span>
                                    <span className="text-slate-50 font-bold text-lg">{stats.monthAppointments}</span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-2">
                                    <div
                                        className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min((stats.completedAppointments / Math.max(stats.monthAppointments, 1)) * 100, 100)}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-emerald-400 flex items-center gap-1">
                                        <CheckCircle2 size={14} /> {stats.completedAppointments} hoàn thành
                                    </span>
                                    <span className="text-slate-500">
                                        {stats.monthAppointments - stats.completedAppointments} còn lại
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Recent Reviews Section */}
            <Card>
                <CardHeader
                    title="Đánh giá gần đây"
                    description="Phản hồi từ bệnh nhân"
                    icon={<Star size={20} />}
                    action={
                        <Button variant="ghost" size="sm" className="text-primary-500">
                            Xem tất cả <ArrowRight size={16} className="ml-2" />
                        </Button>
                    }
                />
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {recentReviews.map((review) => (
                            <ReviewCard key={review.id} review={review} />
                        ))}
                        {recentReviews.length === 0 && (
                            <div className="col-span-3 py-8 text-center">
                                <Star size={48} className="mx-auto text-slate-600 mb-3" />
                                <p className="text-slate-400">Chưa có đánh giá nào</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// ============================================
// Sub-components
// ============================================

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: number | string;
    sublabel: string;
    bgColor: string;
    borderColor: string;
}

const StatCard = ({ icon, label, value, sublabel, bgColor, borderColor }: StatCardProps) => (
    <div className={`${bgColor} border ${borderColor} rounded-xl p-5 transition-all duration-300 hover:scale-[1.02]`}>
        <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-slate-900/50 flex items-center justify-center">
                {icon}
            </div>
            <span className="text-sm font-medium text-slate-300">{label}</span>
        </div>
        <p className="text-3xl font-bold text-slate-50">{value}</p>
        <p className="text-xs text-slate-500 mt-1">{sublabel}</p>
    </div>
);

const ReviewCard = ({ review }: { review: ReviewResponse }) => {
    const stars = Array.from({ length: 5 }, (_, i) => i < review.rating);
    const dateStr = new Date(review.createdAt).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

    return (
        <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50 hover:border-primary-700/30 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary-900/40 flex items-center justify-center text-primary-400 text-xs font-bold">
                        {review.patientName.charAt(0)}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-50">{review.patientName}</p>
                        <p className="text-xs text-slate-500">{dateStr}</p>
                    </div>
                </div>
            </div>
            {/* Stars */}
            <div className="flex items-center gap-0.5 mb-2">
                {stars.map((filled, i) => (
                    <Star
                        key={i}
                        size={14}
                        className={filled ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}
                    />
                ))}
            </div>
            <p className="text-sm text-slate-300 line-clamp-2">{review.comment || 'Không có nhận xét'}</p>
        </div>
    );
};

export default DoctorDashboardPage;
