import { useState, useEffect, useMemo } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    LayoutList,
    Clock,
    User
} from 'lucide-react';
import { Card, CardContent } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Loading } from '@components/ui/Loading';
import { Link } from 'react-router-dom';
import type { AppointmentResponse, AppointmentStatus } from '@/types';
import { AppointmentDetailModal } from '@components/doctor/AppointmentDetailModal';
import { getMyAppointments, updateAppointmentStatus } from '@services/doctorService';

const statusColors: Record<AppointmentStatus, string> = {
    PENDING: 'bg-amber-500',
    CONFIRMED: 'bg-primary-500',
    COMPLETED: 'bg-emerald-500',
    CANCELLED: 'bg-red-500',
    NO_SHOW: 'bg-red-400',
};

const statusLabel: Record<AppointmentStatus, string> = {
    PENDING: 'Chờ',
    CONFIRMED: 'Xác nhận',
    COMPLETED: 'Xong',
    CANCELLED: 'Hủy',
    NO_SHOW: 'Vắng',
};

const DAYS_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTHS_VI = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];

// ============ Component ============
const CalendarPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentResponse | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

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

    // Build calendar grid
    const calendarDays = useMemo(() => {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        const days: { date: string; day: number; isCurrentMonth: boolean; isToday: boolean }[] = [];

        // Prev month trailing days
        for (let i = firstDay - 1; i >= 0; i--) {
            const d = daysInPrevMonth - i;
            const m = month === 0 ? 12 : month;
            const y = month === 0 ? year - 1 : year;
            days.push({
                date: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
                day: d,
                isCurrentMonth: false,
                isToday: false,
            });
        }

        // Current month
        const today = new Date().toISOString().split('T')[0];
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            days.push({
                date: dateStr,
                day: d,
                isCurrentMonth: true,
                isToday: dateStr === today,
            });
        }

        // Next month leading days
        const remaining = 42 - days.length;
        for (let d = 1; d <= remaining; d++) {
            const m = month + 2 > 12 ? 1 : month + 2;
            const y = month + 2 > 12 ? year + 1 : year;
            days.push({
                date: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
                day: d,
                isCurrentMonth: false,
                isToday: false,
            });
        }

        return days;
    }, [year, month]);

    // Appointments per day
    const appointmentsByDate = useMemo(() => {
        const map: Record<string, AppointmentResponse[]> = {};
        appointments.forEach(apt => {
            const d = apt.appointmentDate;
            if (!map[d]) map[d] = [];
            map[d].push(apt);
        });
        return map;
    }, [appointments]);

    const goToPrev = () => setCurrentDate(new Date(year, month - 1, 1));
    const goToNext = () => setCurrentDate(new Date(year, month + 1, 1));
    const goToToday = () => setCurrentDate(new Date());

    const selectedDayAppointments = selectedDay ? (appointmentsByDate[selectedDay] || []) : [];

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

    if (isLoading) return <Loading fullPage text="Đang tải lịch..." />;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-50">Lịch khám bệnh</h1>
                    <p className="text-slate-400 mt-1">Tổng quan lịch hẹn theo tháng</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link to="/doctor/appointments">
                        <Button variant="ghost" size="sm">
                            <LayoutList size={16} className="mr-2" /> Danh sách
                        </Button>
                    </Link>
                    <Link to="/doctor/calendar">
                        <Button variant="outline" size="sm" className="border-primary-700/50 text-primary-400">
                            <CalendarDays size={16} className="mr-2" /> Lịch
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar Grid */}
                <Card className="lg:col-span-2">
                    <CardContent className="p-0">
                        {/* Month Navigator */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-700">
                            <button onClick={goToPrev} className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors">
                                <ChevronLeft size={20} />
                            </button>
                            <div className="text-center">
                                <h2 className="text-lg font-bold text-slate-50">
                                    {MONTHS_VI[month]} {year}
                                </h2>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button size="sm" variant="ghost" onClick={goToToday} className="text-xs text-primary-400">
                                    Hôm nay
                                </Button>
                                <button onClick={goToNext} className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors">
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Day Headers */}
                        <div className="grid grid-cols-7 border-b border-slate-700">
                            {DAYS_VI.map(day => (
                                <div key={day} className="p-2 text-center text-xs font-semibold text-slate-400 uppercase">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Cells */}
                        <div className="grid grid-cols-7">
                            {calendarDays.map((day, idx) => {
                                const dayApts = appointmentsByDate[day.date] || [];
                                const isSelected = selectedDay === day.date;

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedDay(day.date)}
                                        className={`relative min-h-[80px] p-1.5 border-b border-r border-slate-800 text-left transition-all hover:bg-slate-800/50 ${!day.isCurrentMonth ? 'opacity-30' : ''
                                            } ${isSelected ? 'bg-primary-900/20 ring-1 ring-primary-600/50' : ''}
                                        ${day.isToday ? 'bg-primary-900/10' : ''}`}
                                    >
                                        <span className={`text-xs font-medium ${day.isToday
                                            ? 'bg-primary-600 text-white px-1.5 py-0.5 rounded-full'
                                            : day.isCurrentMonth ? 'text-slate-200' : 'text-slate-600'
                                            }`}>
                                            {day.day}
                                        </span>

                                        {/* Appointment dots */}
                                        <div className="mt-1 space-y-0.5">
                                            {dayApts.slice(0, 3).map((apt, i) => (
                                                <div
                                                    key={i}
                                                    className={`flex items-center gap-1 px-1 py-0.5 rounded text-[10px] truncate ${statusColors[apt.status]}/20 border border-transparent`}
                                                >
                                                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusColors[apt.status]}`} />
                                                    <span className="text-slate-200 truncate">{apt.appointmentTime}</span>
                                                </div>
                                            ))}
                                            {dayApts.length > 3 && (
                                                <p className="text-[10px] text-slate-500 px-1">+{dayApts.length - 3} nữa</p>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-4 p-3 border-t border-slate-700">
                            {Object.entries(statusColors).slice(0, 4).map(([status, color]) => (
                                <div key={status} className="flex items-center gap-1.5">
                                    <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                                    <span className="text-[11px] text-slate-400">{statusLabel[status as AppointmentStatus]}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Day Detail Panel */}
                <Card>
                    <CardContent className="p-0">
                        <div className="p-4 border-b border-slate-700">
                            <h3 className="font-semibold text-slate-50">
                                {selectedDay
                                    ? new Date(selectedDay + 'T00:00:00').toLocaleDateString('vi-VN', {
                                        weekday: 'long',
                                        day: '2-digit',
                                        month: '2-digit',
                                    })
                                    : 'Chọn ngày để xem'
                                }
                            </h3>
                            {selectedDay && (
                                <p className="text-xs text-slate-400 mt-1">
                                    {selectedDayAppointments.length} lịch hẹn
                                </p>
                            )}
                        </div>

                        <div className="p-3 space-y-2 max-h-[500px] overflow-y-auto">
                            {selectedDayAppointments.length > 0 ? (
                                selectedDayAppointments
                                    .sort((a, b) => (a.appointmentTime || '').localeCompare(b.appointmentTime || ''))
                                    .map(apt => (
                                        <button
                                            key={apt.id}
                                            onClick={() => { setSelectedAppointment(apt); setIsDetailOpen(true); }}
                                            className="w-full text-left p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-primary-700/30 transition-all"
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <Clock size={12} className="text-primary-400" />
                                                <span className="text-xs font-bold text-primary-400">
                                                    {apt.appointmentTime}
                                                </span>
                                                <div className={`w-2 h-2 rounded-full ml-auto ${statusColors[apt.status]}`} />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <User size={12} className="text-slate-500" />
                                                <span className="text-sm text-slate-200 truncate">{apt.patientName}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1 truncate">{apt.symptoms}</p>
                                        </button>
                                    ))
                            ) : (
                                <div className="py-12 text-center">
                                    <CalendarDays size={40} className="mx-auto text-slate-600 mb-3" />
                                    <p className="text-sm text-slate-400">
                                        {selectedDay ? 'Không có lịch hẹn' : 'Chọn ngày trên lịch'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
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

export default CalendarPage;
