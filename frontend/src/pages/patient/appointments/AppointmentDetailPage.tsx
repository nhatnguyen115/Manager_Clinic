import { useState, useEffect } from 'react';
import {
    Calendar,
    Clock,
    Stethoscope,
    User,
    FileText,
    ChevronLeft,
    CheckCircle2,
    Ban,
    AlertCircle,
    X,
    ArrowRight,
    ClipboardList,
    CreditCard,
} from 'lucide-react';

import { Card, CardHeader, CardContent } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { Loading } from '@components/ui/Loading';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getMyAppointments } from '@services/patientService';
import type { AppointmentResponse, AppointmentStatus } from '@/types';
import { toast } from 'react-hot-toast';
import apiClient from '@services/apiClient';

const statusConfig: Record<AppointmentStatus, {
    label: string;
    variant: 'primary' | 'success' | 'warning' | 'error' | 'info';
    icon: React.ReactNode;
    description: string;
}> = {
    PENDING: {
        label: 'Chờ xác nhận',
        variant: 'warning',
        icon: <AlertCircle size={16} />,
        description: 'Phòng khám đang xem xét và sẽ xác nhận sớm.',
    },
    CONFIRMED: {
        label: 'Đã xác nhận',
        variant: 'primary',
        icon: <CheckCircle2 size={16} />,
        description: 'Lịch hẹn đã được xác nhận. Vui lòng đến đúng giờ.',
    },
    COMPLETED: {
        label: 'Hoàn thành',
        variant: 'success',
        icon: <CheckCircle2 size={16} />,
        description: 'Bạn đã khám xong. Xem bệnh án để biết kết quả.',
    },
    CANCELLED: {
        label: 'Đã hủy',
        variant: 'error',
        icon: <Ban size={16} />,
        description: 'Lịch hẹn này đã bị hủy.',
    },
    NO_SHOW: {
        label: 'Không đến',
        variant: 'error',
        icon: <Ban size={16} />,
        description: 'Bạn đã không đến vào giờ hẹn.',
    },
};

// ─── Info Row Component ───────────────────────────────
const InfoRow = ({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string | undefined | null;
}) => {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3 py-3 border-b border-dark-800/50 last:border-0">
            <div className="flex-shrink-0 w-9 h-9 bg-dark-800/60 rounded-lg flex items-center justify-center text-dark-400 mt-0.5">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-xs text-dark-500 uppercase tracking-wide font-medium">{label}</p>
                <p className="text-dark-100 font-medium mt-0.5">{value}</p>
            </div>
        </div>
    );
};

// ─── Cancel Modal ─────────────────────────────────────
interface CancelModalProps {
    onClose: () => void;
    onConfirm: (reason: string) => Promise<void>;
}

const CancelModal = ({ onClose, onConfirm }: CancelModalProps) => {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        await onConfirm(reason);
        setLoading(false);
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-dark-900 border border-dark-700 rounded-2xl shadow-2xl w-full max-w-md">
                    <div className="flex items-center justify-between p-6 border-b border-dark-700">
                        <h3 className="text-lg font-bold text-dark-50">Hủy lịch hẹn</h3>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-dark-50 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <div className="p-6 space-y-4">
                        <p className="text-dark-300 text-sm">
                            Bạn có chắc muốn hủy lịch hẹn này? Hành động này không thể hoàn tác.
                        </p>
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-2">
                                Lý do hủy <span className="text-dark-500">(không bắt buộc)</span>
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Ví dụ: Bận công việc đột xuất..."
                                rows={3}
                                className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-dark-50 placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 resize-none text-sm"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3 p-6 pt-0">
                        <Button variant="outline" fullWidth onClick={onClose} disabled={loading}>
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

// ─── Main Page ────────────────────────────────────────
const AppointmentDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [appointment, setAppointment] = useState<AppointmentResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showCancelModal, setShowCancelModal] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                setIsLoading(true);
                // Fetch from my appointments (no single-by-id endpoint for patient)
                const all = await getMyAppointments();
                const found = all.find((a) => a.id === id);
                if (found) {
                    setAppointment(found);
                } else {
                    toast.error('Không tìm thấy lịch hẹn');
                    navigate('/appointments');
                }
            } catch (error) {
                console.error('Failed to load appointment:', error);
                toast.error('Không thể tải thông tin lịch hẹn');
                navigate('/appointments');
            } finally {
                setIsLoading(false);
            }
        };
        if (id) load();
    }, [id, navigate]);

    const handleCancel = async (reason: string) => {
        if (!appointment) return;
        try {
            await apiClient.put(`/appointments/${appointment.id}/cancel`, {
                reason: reason.trim() || 'Bệnh nhân yêu cầu hủy',
            });
            toast.success('Đã hủy lịch hẹn thành công');
            setShowCancelModal(false);
            navigate('/appointments');
        } catch (error) {
            console.error('Failed to cancel:', error);
            toast.error('Không thể hủy lịch hẹn. Vui lòng thử lại.');
        }
    };

    if (isLoading) return <Loading fullPage text="Đang tải..." />;
    if (!appointment) return null;

    const cfg = statusConfig[appointment.status];
    const canCancel = appointment.status === 'PENDING' || appointment.status === 'CONFIRMED';

    const dateObj = new Date(appointment.appointmentDate + 'T00:00:00');
    const dateStr = dateObj.toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            {/* Back navigation */}
            <div className="flex items-center gap-2">
                <Link to="/appointments">
                    <Button variant="ghost" size="sm" className="text-dark-400 hover:text-dark-50 -ml-2">
                        <ChevronLeft size={18} className="mr-1" /> Lịch hẹn của tôi
                    </Button>
                </Link>
            </div>

            {/* Status Banner */}
            <div className={`flex items-center gap-4 p-4 rounded-2xl border ${appointment.status === 'COMPLETED'
                ? 'bg-emerald-900/10 border-emerald-800/30'
                : appointment.status === 'CANCELLED' || appointment.status === 'NO_SHOW'
                    ? 'bg-red-900/10 border-red-800/30'
                    : appointment.status === 'CONFIRMED'
                        ? 'bg-primary-900/10 border-primary-800/30'
                        : 'bg-amber-900/10 border-amber-800/30'
                }`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${appointment.status === 'COMPLETED' ? 'bg-emerald-900/30 text-emerald-400'
                    : appointment.status === 'CANCELLED' || appointment.status === 'NO_SHOW' ? 'bg-red-900/30 text-red-400'
                        : appointment.status === 'CONFIRMED' ? 'bg-primary-900/30 text-primary-400'
                            : 'bg-amber-900/30 text-amber-400'
                    }`}>
                    {cfg.icon}
                </div>
                <div>
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    <p className="text-sm text-dark-400 mt-1">{cfg.description}</p>
                </div>
            </div>

            {/* Appointment Info Card */}
            <Card>
                <CardHeader
                    title="Chi tiết lịch hẹn"
                    icon={<Stethoscope size={18} />}
                />
                <CardContent className="divide-y divide-dark-800/50">
                    <InfoRow
                        icon={<User size={16} />}
                        label="Bác sĩ"
                        value={`BS. ${appointment.doctorName}`}
                    />
                    <InfoRow
                        icon={<Stethoscope size={16} />}
                        label="Chuyên khoa"
                        value={appointment.specialtyName}
                    />
                    <InfoRow
                        icon={<Calendar size={16} />}
                        label="Ngày khám"
                        value={dateStr}
                    />
                    <InfoRow
                        icon={<Clock size={16} />}
                        label="Giờ khám"
                        value={appointment.appointmentTime}
                    />
                    {appointment.symptoms && (
                        <InfoRow
                            icon={<FileText size={16} />}
                            label="Triệu chứng"
                            value={appointment.symptoms}
                        />
                    )}
                    {appointment.notes && (
                        <InfoRow
                            icon={<FileText size={16} />}
                            label="Ghi chú"
                            value={appointment.notes}
                        />
                    )}
                    {appointment.cancelledReason && (
                        <InfoRow
                            icon={<Ban size={16} />}
                            label="Lý do hủy"
                            value={appointment.cancelledReason}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
                <CardHeader title="Lịch sử trạng thái" icon={<ClipboardList size={18} />} />
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />
                            <div className="flex-1 flex items-center justify-between">
                                <span className="text-sm text-dark-200">Đã đặt lịch</span>
                                <span className="text-xs text-dark-500">
                                    {new Date(appointment.createdAt).toLocaleDateString('vi-VN')}
                                </span>
                            </div>
                        </div>
                        {appointment.confirmedAt && (
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-primary-400 flex-shrink-0" />
                                <div className="flex-1 flex items-center justify-between">
                                    <span className="text-sm text-dark-200">Đã xác nhận</span>
                                    <span className="text-xs text-dark-500">
                                        {new Date(appointment.confirmedAt).toLocaleDateString('vi-VN')}
                                    </span>
                                </div>
                            </div>
                        )}
                        {appointment.completedAt && (
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                                <div className="flex-1 flex items-center justify-between">
                                    <span className="text-sm text-dark-200">Hoàn thành khám</span>
                                    <span className="text-xs text-dark-500">
                                        {new Date(appointment.completedAt).toLocaleDateString('vi-VN')}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
                {appointment.status === 'COMPLETED' && (
                    <Link to="/medical-history" className="flex-1">
                        <Button fullWidth variant="outline" className="border-emerald-700/50 text-emerald-400 hover:bg-emerald-900/20">
                            <ClipboardList size={16} className="mr-2" /> Xem bệnh án
                        </Button>
                    </Link>
                )}
                {appointment.status === 'CONFIRMED' && (
                    <Link to={`/checkout/${appointment.id}`} className="flex-1">
                        <Button fullWidth className="bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-900/20">
                            <CreditCard size={16} className="mr-2" /> Thanh toán ngay
                        </Button>
                    </Link>
                )}
                <Link to="/booking/specialty" className="flex-1">

                    <Button fullWidth variant="outline">
                        <ArrowRight size={16} className="mr-2" /> Đặt lịch mới
                    </Button>
                </Link>
                {canCancel && (
                    <Button
                        className="flex-1 bg-red-600 hover:bg-red-500 text-white"
                        onClick={() => setShowCancelModal(true)}
                    >
                        <X size={16} className="mr-2" /> Hủy lịch hẹn
                    </Button>
                )}
            </div>

            {showCancelModal && (
                <CancelModal
                    onClose={() => setShowCancelModal(false)}
                    onConfirm={handleCancel}
                />
            )}
        </div>
    );
};

export default AppointmentDetailPage;
