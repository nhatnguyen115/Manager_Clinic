import { useState, useEffect, useMemo } from 'react';
import {
    Calendar,
    Search,
    Filter,
    CheckCircle2,
    XCircle,
    Eye,
    LayoutList,
    CalendarDays,
} from 'lucide-react';
import { Card, CardContent } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { Input } from '@components/ui/Input';
import { Loading } from '@components/ui/Loading';
import { Link } from 'react-router-dom';
import type { AppointmentResponse, AppointmentStatus } from '@/types';
import { AppointmentDetailModal } from '@components/doctor/AppointmentDetailModal';
import { getMyAppointments, updateAppointmentStatus } from '@services/doctorService';

// ============ Constants ============
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

const statusFilters: { value: string; label: string }[] = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'PENDING', label: 'Chờ xác nhận' },
    { value: 'CONFIRMED', label: 'Đã xác nhận' },
    { value: 'COMPLETED', label: 'Hoàn thành' },
    { value: 'CANCELLED', label: 'Đã hủy' },
];

// ============ Component ============
const AppointmentListPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentResponse | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                setIsLoading(true);
                const data = await getMyAppointments();
                setAppointments(data);
            } catch (error) {
                console.error('Failed to load appointments:', error);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    // Filtered appointments
    const filtered = useMemo(() => {
        return appointments.filter(apt => {
            const matchesSearch = !searchQuery ||
                apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                apt.symptoms?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'ALL' || apt.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [appointments, searchQuery, statusFilter]);

    // Group by date
    const groupedByDate = useMemo(() => {
        const groups: Record<string, AppointmentResponse[]> = {};
        filtered.forEach(apt => {
            const date = apt.appointmentDate;
            if (!groups[date]) groups[date] = [];
            groups[date].push(apt);
        });
        return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a)); // Newest date first
    }, [filtered]);

    const handleAction = async (appointment: AppointmentResponse, action: string) => {
        try {
            const statusMap: Record<string, string> = {
                'CONFIRM': 'CONFIRMED',
                'REJECT': 'CANCELLED',
                'CANCEL': 'CANCELLED',
                'COMPLETE': 'COMPLETED',
            };
            const newStatus = statusMap[action];
            if (!newStatus) return;

            await updateAppointmentStatus(appointment.id, newStatus);
            setAppointments(prev => prev.map(apt =>
                apt.id === appointment.id ? { ...apt, status: newStatus as AppointmentStatus } : apt
            ));
        } catch (error) {
            console.error('Failed to update status:', error);
        }
        setIsDetailOpen(false);
    };

    if (isLoading) return <Loading fullPage text="Đang tải lịch hẹn..." />;

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-50">Quản lý lịch hẹn</h1>
                    <p className="text-slate-400 mt-1">Xem và quản lý tất cả lịch hẹn của bạn</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link to="/doctor/appointments">
                        <Button variant="outline" size="sm" className="border-primary-700/50 text-primary-400">
                            <LayoutList size={16} className="mr-2" /> Danh sách
                        </Button>
                    </Link>
                    <Link to="/doctor/calendar">
                        <Button variant="ghost" size="sm">
                            <CalendarDays size={16} className="mr-2" /> Lịch
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="py-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <Input
                                placeholder="Tìm bệnh nhân, triệu chứng..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        {/* Status Filter */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                            <Filter size={16} className="text-slate-400 flex-shrink-0" />
                            {statusFilters.map(sf => (
                                <button
                                    key={sf.value}
                                    onClick={() => setStatusFilter(sf.value)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all ${statusFilter === sf.value
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                        }`}
                                >
                                    {sf.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Results Count */}
            <p className="text-sm text-slate-400">
                Hiển thị <span className="font-semibold text-slate-200">{filtered.length}</span> lịch hẹn
            </p>

            {/* Grouped Appointment List */}
            <div className="space-y-6">
                {groupedByDate.map(([date, apts]) => {
                    const isToday = date === today;
                    const dateObj = new Date(date + 'T00:00:00');
                    const label = isToday
                        ? 'Hôm nay'
                        : dateObj.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });

                    return (
                        <div key={date}>
                            {/* Date Header */}
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${isToday ? 'bg-primary-600 text-white' : 'bg-slate-800 text-slate-400'
                                    }`}>
                                    <Calendar size={16} />
                                </div>
                                <h3 className={`text-sm font-semibold uppercase tracking-wider ${isToday ? 'text-primary-400' : 'text-slate-400'
                                    }`}>
                                    {label}
                                </h3>
                                <div className="flex-1 border-t border-slate-800" />
                                <span className="text-xs text-slate-500">{apts.length} lịch hẹn</span>
                            </div>

                            {/* Appointment Cards */}
                            <div className="space-y-2">
                                {apts.sort((a, b) => (a.appointmentTime || '').localeCompare(b.appointmentTime || '')).map(apt => (
                                    <div
                                        key={apt.id}
                                        className="flex items-center gap-4 p-4 bg-slate-900 rounded-xl border border-slate-700/50 hover:border-primary-700/30 transition-all duration-200 cursor-pointer group"
                                        onClick={() => { setSelectedAppointment(apt); setIsDetailOpen(true); }}
                                    >
                                        {/* Time */}
                                        <div className="flex-shrink-0 text-center min-w-[60px]">
                                            <p className="text-base font-bold text-primary-400">{apt.appointmentTime}</p>
                                        </div>

                                        <div className="w-px h-10 bg-slate-700 group-hover:bg-primary-700/30 transition-colors" />

                                        {/* Patient */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h4 className="font-semibold text-slate-50 truncate text-sm">{apt.patientName}</h4>
                                                <Badge variant={statusVariant[apt.status]} size="sm">
                                                    {statusLabel[apt.status]}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-slate-400 truncate">{apt.symptoms || 'Chưa có triệu chứng'}</p>
                                        </div>

                                        {/* Quick Actions */}
                                        <div className="flex-shrink-0 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {apt.status === 'PENDING' && (
                                                <>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleAction(apt, 'CONFIRM'); }}
                                                        className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 transition-colors"
                                                        title="Xác nhận"
                                                    >
                                                        <CheckCircle2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleAction(apt, 'REJECT'); }}
                                                        className="p-1.5 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
                                                        title="Từ chối"
                                                    >
                                                        <XCircle size={16} />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setSelectedAppointment(apt); setIsDetailOpen(true); }}
                                                className="p-1.5 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
                                                title="Chi tiết"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}

                {groupedByDate.length === 0 && (
                    <div className="text-center py-16">
                        <Calendar size={56} className="mx-auto text-slate-600 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-300 mb-2">Không tìm thấy lịch hẹn</h3>
                        <p className="text-slate-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedAppointment && (
                <AppointmentDetailModal
                    isOpen={isDetailOpen}
                    onClose={() => setIsDetailOpen(false)}
                    appointment={selectedAppointment}
                    onAction={handleAction}
                />
            )}
        </div>
    );
};

export default AppointmentListPage;
