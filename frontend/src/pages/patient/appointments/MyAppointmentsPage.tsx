import { useState, useEffect, useMemo } from 'react';
import {
    Calendar,
    Clock,
    Search,
    Filter,
    ChevronRight,
    Plus,
    X,
    CheckCircle2,
    AlertCircle,
    Ban,
    Stethoscope,
    Star,
} from 'lucide-react';
import { Card, CardContent } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { Loading } from '@components/ui/Loading';
import { Link, useNavigate } from 'react-router-dom';
import { getMyAppointments } from '@services/patientService';
import type { AppointmentResponse, AppointmentStatus } from '@/types';
import { toast } from 'react-hot-toast';
import apiClient from '@services/apiClient';
import { ReviewModal } from '@components/appointments/ReviewModal';

// ─── Status config ───────────────────────────────────
const statusConfig: Record<AppointmentStatus, {
    label: string;
    variant: 'primary' | 'success' | 'warning' | 'error' | 'info';
    icon: React.ReactNode;
}> = {
    PENDING: { label: 'Chờ xác nhận', variant: 'warning', icon: <AlertCircle size={12} /> },
    CONFIRMED: { label: 'Đã xác nhận', variant: 'primary', icon: <CheckCircle2 size={12} /> },
    COMPLETED: { label: 'Hoàn thành', variant: 'success', icon: <CheckCircle2 size={12} /> },
    CANCELLED: { label: 'Đã hủy', variant: 'error', icon: <Ban size={12} /> },
    NO_SHOW: { label: 'Không đến', variant: 'error', icon: <Ban size={12} /> },
};

const filterOptions: { value: AppointmentStatus | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'PENDING', label: 'Chờ xác nhận' },
    { value: 'CONFIRMED', label: 'Đã xác nhận' },
    { value: 'COMPLETED', label: 'Hoàn thành' },
    { value: 'CANCELLED', label: 'Đã hủy' },
];

// ─── Cancel Modal ─────────────────────────────────────
interface CancelModalProps {
    appointment: AppointmentResponse;
    onClose: () => void;
    onConfirm: (reason: string) => Promise<void>;
}

const CancelModal = ({ appointment, onClose, onConfirm }: CancelModalProps) => {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        await onConfirm(reason);
        setLoading(false);
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                onClick={onClose}
            />
            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md">
                    <div className="flex items-center justify-between p-6 border-b border-slate-700">
                        <div>
                            <h3 className="text-lg font-bold text-slate-50">Hủy lịch hẹn</h3>
                            <p className="text-sm text-slate-400 mt-0.5">
                                BS. {appointment.doctorName} — {appointment.appointmentDate}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-50 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <div className="p-6 space-y-4">
                        <p className="text-slate-300 text-sm">
                            Bạn có chắc muốn hủy lịch hẹn này? Hành động này không thể hoàn tác.
                        </p>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Lý do hủy <span className="text-slate-500">(không bắt buộc)</span>
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Ví dụ: Bận công việc đột xuất..."
                                rows={3}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 resize-none text-sm"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3 p-6 pt-0">
                        <Button
                            variant="outline"
                            fullWidth
                            onClick={onClose}
                            disabled={loading}
                        >
                            Giữ lịch hẹn
                        </Button>
                        <Button
                            fullWidth
                            className="bg-red-600 hover:bg-red-500 text-white"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? 'Đang hủy...' : 'Xác nhận hủy'}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};

// ─── Appointment Card ─────────────────────────────────
interface AppointmentCardProps {
    apt: AppointmentResponse;
    onCancel: (apt: AppointmentResponse) => void;
    onReview: (apt: AppointmentResponse) => void;
}

const AppointmentCard = ({ apt, onCancel, onReview }: AppointmentCardProps) => {
    const navigate = useNavigate();
    const cfg = statusConfig[apt.status];
    const isPast = apt.status === 'COMPLETED' || apt.status === 'CANCELLED' || apt.status === 'NO_SHOW';
    const canCancel = apt.status === 'PENDING' || apt.status === 'CONFIRMED';

    const dateObj = new Date(apt.appointmentDate + 'T00:00:00');
    const dateStr = dateObj.toLocaleDateString('vi-VN', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

    return (
        <div
            className={`group flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-5 rounded-2xl border transition-all duration-200 cursor-pointer hover:shadow-lg ${isPast
                ? 'bg-slate-900/30 border-slate-800/50 hover:border-slate-700'
                : 'bg-slate-800/40 border-slate-700/50 hover:border-primary-700/40 hover:bg-slate-800/60'
                }`}
            onClick={() => navigate(`/appointments/${apt.id}`)}
        >
            {/* Date block */}
            <div className={`flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 rounded-xl border ${isPast ? 'bg-slate-800/50 border-slate-700/50 text-slate-500' : 'bg-primary-900/30 border-primary-800/50 text-primary-400'
                }`}>
                <p className="text-2xl font-bold leading-none">
                    {dateObj.getDate().toString().padStart(2, '0')}
                </p>
                <p className="text-xs font-medium mt-1 uppercase">
                    {dateObj.toLocaleDateString('vi-VN', { month: 'short' })}
                </p>
                <p className="text-xs opacity-70">{dateObj.getFullYear()}</p>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4 className="font-semibold text-slate-50 truncate">
                        BS. {apt.doctorName}
                    </h4>
                    <Badge variant={cfg.variant} size="sm">
                        <span className="flex items-center gap-1">
                            {cfg.icon} {cfg.label}
                        </span>
                    </Badge>
                </div>
                {apt.specialtyName && (
                    <p className="text-sm text-primary-400/80 font-medium mb-1.5">{apt.specialtyName}</p>
                )}
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-500" />
                        {dateStr}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Clock size={13} className="text-slate-500" />
                        {apt.appointmentTime}
                    </span>
                </div>
                {apt.symptoms && (
                    <p className="text-xs text-slate-500 mt-2 line-clamp-1">
                        <span className="text-slate-600">Triệu chứng:</span> {apt.symptoms}
                    </p>
                )}
            </div>

            {/* Actions */}
            <div className="flex-shrink-0 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                {canCancel && (
                    <Button
                        size="sm"
                        variant="outline"
                        className="border-red-800/50 text-red-400 hover:bg-red-900/20 hover:border-red-700"
                        onClick={() => onCancel(apt)}
                    >
                        <X size={14} className="mr-1" /> Hủy
                    </Button>
                )}
                {apt.status === 'COMPLETED' && (
                    <Button
                        size="sm"
                        variant="outline"
                        className="border-warning/50 text-warning hover:bg-warning/10"
                        onClick={() => onReview(apt)}
                    >
                        <Star size={14} className="mr-1 fill-warning" /> Đánh giá
                    </Button>
                )}
                <Button
                    size="sm"
                    variant="ghost"
                    className="text-slate-400 hover:text-slate-50 group-hover:text-primary-400"
                    onClick={() => navigate(`/appointments/${apt.id}`)}
                >
                    <ChevronRight size={18} />
                </Button>
            </div>
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────
const MyAppointmentsPage = () => {
    const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'ALL'>('ALL');
    const [cancelTarget, setCancelTarget] = useState<AppointmentResponse | null>(null);
    const [reviewTarget, setReviewTarget] = useState<AppointmentResponse | null>(null);

    const loadAppointments = async () => {
        try {
            setIsLoading(true);
            const data = await getMyAppointments();
            // Sort: newest date first, then newest time first
            data.sort((a, b) => {
                const dateDiff = b.appointmentDate.localeCompare(a.appointmentDate);
                if (dateDiff !== 0) return dateDiff;
                return (b.appointmentTime || '').localeCompare(a.appointmentTime || '');
            });
            setAppointments(data);
        } catch (error) {
            console.error('Failed to load appointments:', error);
            toast.error('Không thể tải danh sách lịch hẹn');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadAppointments();
    }, []);

    const handleCancel = async (reason: string) => {
        if (!cancelTarget) return;
        try {
            await apiClient.put(`/appointments/${cancelTarget.id}/cancel`, {
                reason: reason.trim() || 'Bệnh nhân yêu cầu hủy',
            });
            toast.success('Đã hủy lịch hẹn thành công');
            setCancelTarget(null);
            loadAppointments();
        } catch (error) {
            console.error('Failed to cancel appointment:', error);
            toast.error('Không thể hủy lịch hẹn. Vui lòng thử lại.');
        }
    };

    const filtered = useMemo(() => {
        return appointments.filter((apt) => {
            const matchesStatus = statusFilter === 'ALL' || apt.status === statusFilter;
            const matchesSearch =
                !searchQuery ||
                apt.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (apt.specialtyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                apt.appointmentDate.includes(searchQuery);
            return matchesStatus && matchesSearch;
        });
    }, [appointments, statusFilter, searchQuery]);

    const upcomingCount = appointments.filter((a) =>
        ['PENDING', 'CONFIRMED'].includes(a.status)
    ).length;

    if (isLoading) return <Loading fullPage text="Đang tải lịch hẹn..." />;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-50 flex items-center gap-2">
                        <Stethoscope className="text-primary-400" size={24} />
                        Lịch hẹn của tôi
                    </h1>
                    <p className="text-slate-400 mt-1 text-sm">
                        {upcomingCount > 0
                            ? `Bạn có ${upcomingCount} lịch hẹn sắp tới`
                            : 'Quản lý tất cả lịch hẹn khám bệnh'}
                    </p>
                </div>
                <Link to="/booking/specialty">
                    <Button className="bg-primary-600 hover:bg-primary-500">
                        <Plus size={16} className="mr-2" /> Đặt lịch mới
                    </Button>
                </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
                <div className="glass-stat rounded-xl p-4 text-center transition-all duration-200 hover:scale-[1.02]">
                    <p className="text-2xl font-black text-primary-400">{upcomingCount}</p>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">Sắp tới</p>
                </div>
                <div className="glass-stat rounded-xl p-4 text-center transition-all duration-200 hover:scale-[1.02]" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.03) 100%)', borderColor: 'rgba(16,185,129,0.15)' }}>
                    <p className="text-2xl font-black text-emerald-400">{appointments.filter(a => a.status === 'COMPLETED').length}</p>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">Hoàn thành</p>
                </div>
                <div className="glass-stat rounded-xl p-4 text-center transition-all duration-200 hover:scale-[1.02]" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(239,68,68,0.03) 100%)', borderColor: 'rgba(239,68,68,0.15)' }}>
                    <p className="text-2xl font-black text-red-400">{appointments.filter(a => a.status === 'CANCELLED').length}</p>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">Đã hủy</p>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4 space-y-3">
                    {/* Search */}
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Tìm kiếm theo bác sĩ, chuyên khoa, ngày..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50"
                        />
                    </div>

                    {/* Status filter tabs */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <Filter size={14} className="text-slate-500 flex-shrink-0" />
                        {filterOptions.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setStatusFilter(opt.value)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${statusFilter === opt.value
                                    ? 'bg-primary-600 text-white shadow-sm shadow-primary-900/50'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                                    }`}
                            >
                                {opt.label}
                                {opt.value !== 'ALL' && (
                                    <span className="ml-1.5 opacity-60">
                                        ({appointments.filter((a) => a.status === opt.value).length})
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Appointment List */}
            <div className="space-y-3">
                {filtered.length > 0 ? (
                    filtered.map((apt) => (
                        <AppointmentCard
                            key={apt.id}
                            apt={apt}
                            onCancel={setCancelTarget}
                            onReview={setReviewTarget}
                        />
                    ))
                ) : (
                    <div className="py-16 text-center">
                        <div className="w-20 h-20 bg-slate-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Calendar size={36} className="text-slate-600" />
                        </div>
                        <p className="text-slate-400 text-lg font-medium">
                            {searchQuery || statusFilter !== 'ALL'
                                ? 'Không tìm thấy lịch hẹn phù hợp'
                                : 'Bạn chưa có lịch hẹn nào'}
                        </p>
                        <p className="text-slate-500 text-sm mt-1">
                            {searchQuery || statusFilter !== 'ALL'
                                ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                                : 'Hãy đặt lịch khám ngay hôm nay!'}
                        </p>
                        {!searchQuery && statusFilter === 'ALL' && (
                            <Link to="/booking/specialty">
                                <Button className="mt-4 bg-primary-600 hover:bg-primary-500">
                                    <Plus size={16} className="mr-2" /> Đặt lịch ngay
                                </Button>
                            </Link>
                        )}
                    </div>
                )}
            </div>

            {/* Cancel Modal */}
            {cancelTarget && (
                <CancelModal
                    appointment={cancelTarget}
                    onClose={() => setCancelTarget(null)}
                    onConfirm={handleCancel}
                />
            )}

            {/* Review Modal */}
            {reviewTarget && (
                <ReviewModal
                    isOpen={!!reviewTarget}
                    onClose={() => setReviewTarget(null)}
                    doctorName={reviewTarget.doctorName}
                    appointmentId={reviewTarget.id}
                />
            )}
        </div>
    );
};

export default MyAppointmentsPage;
