import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Clock, Plus, Trash2, Save, Calendar, CalendarOff,
    ToggleLeft, ToggleRight, CheckCircle2, X,
    Copy, RefreshCcw, Info, AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { Loading } from '@components/ui/Loading';
import { Modal } from '@components/ui/Modal';
import { useAuth } from '@contexts/AuthContext';
import { useToast } from '@hooks/useToast';
import { getMySchedule, updateMySchedule } from '@services/doctorService';
import { cn } from '@utils';
import type { Schedule, ScheduleTimeSlot, LeaveDay } from '@/types';

// ============ Constants ============
const DAYS_VI = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
const DAYS_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const DEFAULT_SLOTS: ScheduleTimeSlot[] = [
    { startTime: '08:00', endTime: '08:30', maxPatients: 1, isAvailable: true },
    { startTime: '08:30', endTime: '09:00', maxPatients: 1, isAvailable: true },
    { startTime: '09:00', endTime: '09:30', maxPatients: 1, isAvailable: true },
    { startTime: '09:30', endTime: '10:00', maxPatients: 1, isAvailable: true },
    { startTime: '10:00', endTime: '10:30', maxPatients: 1, isAvailable: true },
    { startTime: '10:30', endTime: '11:00', maxPatients: 1, isAvailable: true },
    { startTime: '14:00', endTime: '14:30', maxPatients: 1, isAvailable: true },
    { startTime: '14:30', endTime: '15:00', maxPatients: 1, isAvailable: true },
    { startTime: '15:00', endTime: '15:30', maxPatients: 1, isAvailable: true },
    { startTime: '15:30', endTime: '16:00', maxPatients: 1, isAvailable: true },
];

// Generate default schedule if API returns empty
const generateDefaultSchedule = (): Schedule[] => {
    return Array.from({ length: 7 }, (_, i) => ({
        id: i,
        dayOfWeek: i,
        isAvailable: i !== 0,
        notes: i === 0 ? 'Nghỉ cuối tuần' : '',
        timeSlots: i === 0 ? [] : [...DEFAULT_SLOTS],
    }));
};

// ============ Tabs ============
type TabId = 'weekly' | 'timeslots' | 'leave';

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'weekly', label: 'Lịch tuần', icon: <Calendar size={16} /> },
    { id: 'timeslots', label: 'Khung giờ', icon: <Clock size={16} /> },
    { id: 'leave', label: 'Ngày nghỉ', icon: <CalendarOff size={16} /> },
];

// ============ Main Component ============
const SchedulePage = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabId>('weekly');
    const [schedule, setSchedule] = useState<Schedule[]>(generateDefaultSchedule);
    const [leaveDays, setLeaveDays] = useState<LeaveDay[]>([]);
    const [selectedDay, setSelectedDay] = useState<number>(1);
    const [hasChanges, setHasChanges] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
    const [copyTargetDays, setCopyTargetDays] = useState<number[]>([]);

    // Load schedule from API
    useEffect(() => {
        const load = async () => {
            if (!user) return;
            try {
                setIsLoading(true);
                const doctorId = user.doctorId || user.id;
                const data = await getMySchedule(doctorId);
                if (data && data.length > 0) {
                    // Split weekly recurring schedules and specific date overrides
                    const weekly = data.filter(s => !s.specificDate);
                    const specific = data.filter(s => !!s.specificDate);

                    if (weekly.length > 0) {
                        // Ensure we have all 7 days even if backend missing some
                        const fullWeekly = generateDefaultSchedule().map(def => {
                            const found = weekly.find(w => w.dayOfWeek === def.dayOfWeek);
                            return found || def;
                        });
                        setSchedule(fullWeekly);
                    }

                    // Map specific dates where isAvailable is false to leaveDays state
                    const existingLeave = specific
                        .filter(s => !s.isAvailable)
                        .map(s => ({
                            date: s.specificDate!,
                            reason: s.notes || 'Nghỉ phép'
                        }));
                    setLeaveDays(existingLeave);
                }
            } catch (error) {
                console.error('Failed to load schedule:', error);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [user?.id, user?.doctorId]);

    const markChanged = () => { setHasChanges(true); setSaveStatus('idle'); };

    // Toggle day availability
    const toggleDay = useCallback((dayOfWeek: number) => {
        setSchedule(prev => prev.map(s =>
            s.dayOfWeek === dayOfWeek
                ? { ...s, isAvailable: !s.isAvailable, timeSlots: !s.isAvailable ? [...DEFAULT_SLOTS] : [] }
                : s
        ));
        markChanged();
    }, []);

    // Update time slot
    const updateSlot = useCallback((dayOfWeek: number, slotIndex: number, updates: Partial<ScheduleTimeSlot>) => {
        setSchedule(prev => prev.map(s =>
            s.dayOfWeek === dayOfWeek
                ? {
                    ...s,
                    timeSlots: s.timeSlots.map((slot, i) => i === slotIndex ? { ...slot, ...updates } : slot),
                }
                : s
        ));
        markChanged();
    }, []);

    // Add slot
    const addSlot = useCallback((dayOfWeek: number) => {
        setSchedule(prev => prev.map(s => {
            if (s.dayOfWeek !== dayOfWeek) return s;
            const lastSlot = s.timeSlots[s.timeSlots.length - 1];
            const newStart = lastSlot ? lastSlot.endTime : '08:00';
            const [h, m] = newStart.split(':').map(Number);
            const newEnd = `${String(h + (m >= 30 ? 1 : 0)).padStart(2, '0')}:${m >= 30 ? '00' : '30'}`;
            return {
                ...s,
                timeSlots: [...s.timeSlots, { startTime: newStart, endTime: newEnd, maxPatients: 1, isAvailable: true }],
            };
        }));
        markChanged();
    }, []);

    // Remove slot
    const removeSlot = useCallback((dayOfWeek: number, slotIndex: number) => {
        setSchedule(prev => prev.map(s =>
            s.dayOfWeek === dayOfWeek
                ? { ...s, timeSlots: s.timeSlots.filter((_, i) => i !== slotIndex) }
                : s
        ));
        markChanged();
    }, []);

    // Add leave day
    const addLeaveDay = useCallback((date: string, reason: string) => {
        if (!date) return;
        setLeaveDays(prev => [...prev, { date, reason }].sort((a, b) => a.date.localeCompare(b.date)));
        markChanged();
    }, []);

    // Remove leave day
    const removeLeaveDay = useCallback((date: string) => {
        setLeaveDays(prev => prev.filter(d => d.date !== date));
        markChanged();
    }, []);

    // Save to API
    const handleSave = async () => {
        if (!user?.id) return;
        try {
            setSaveStatus('saving');
            showToast.loading('Đang lưu lịch làm việc...');

            // 1. Prepare weekly schedules
            const weeklyPayload = schedule.map(s => ({
                ...s,
                specificDate: undefined
            }));

            // 2. Prepare leave days
            const leavePayload = leaveDays.map(ld => {
                const dateObj = new Date(ld.date);
                return {
                    dayOfWeek: dateObj.getDay(),
                    specificDate: ld.date,
                    isAvailable: false,
                    notes: ld.reason,
                    timeSlots: []
                };
            });

            // 3. Combine and send
            const doctorId = user.doctorId || user.id;
            const fullPayload = [...weeklyPayload, ...leavePayload];
            await updateMySchedule(doctorId, fullPayload);

            setSaveStatus('saved');
            setHasChanges(false);
            showToast.success('Đã cập nhật lịch làm việc thành công!');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (error) {
            console.error('Failed to save schedule:', error);
            setSaveStatus('idle');
            showToast.error('Lưu lịch làm việc thất bại. Vui lòng thử lại.');
        } finally {
            showToast.dismiss();
        }
    };

    // Copy schedule logic
    const handleCopySchedule = () => {
        if (copyTargetDays.length === 0) return;
        const sourceSchedule = schedule.find(s => s.dayOfWeek === selectedDay);
        if (!sourceSchedule) return;

        setSchedule(prev => prev.map(s => {
            if (copyTargetDays.includes(s.dayOfWeek)) {
                return {
                    ...s,
                    isAvailable: sourceSchedule.isAvailable,
                    timeSlots: JSON.parse(JSON.stringify(sourceSchedule.timeSlots)),
                    notes: sourceSchedule.notes
                };
            }
            return s;
        }));

        markChanged();
        setIsCopyModalOpen(false);
        setCopyTargetDays([]);
        showToast.success(`Đã sao chép lịch từ ${DAYS_VI[selectedDay]} sang ${copyTargetDays.length} ngày khác.`);
    };

    // Reset day to default
    const handleResetDay = (dayOfWeek: number) => {
        if (window.confirm(`Bạn có muốn đặt lại lịch cho ${DAYS_VI[dayOfWeek]} về mặc định?`)) {
            setSchedule(prev => prev.map(s =>
                s.dayOfWeek === dayOfWeek
                    ? { ...s, isAvailable: true, timeSlots: [...DEFAULT_SLOTS], notes: '' }
                    : s
            ));
            markChanged();
            showToast.success(`Đã đặt lại lịch ${DAYS_VI[dayOfWeek]}.`);
        }
    };

    const handleRemoveLeaveWithConfirm = (date: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa ngày nghỉ này?')) {
            removeLeaveDay(date);
            showToast.success('Đã xóa ngày nghỉ.');
        }
    };

    const selectedSchedule = schedule.find(s => s.dayOfWeek === selectedDay);

    if (isLoading) return <Loading fullPage text="Đang tải lịch làm việc..." />;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-8 border-b border-slate-700/50 bg-slate-900/20">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-primary-600/10 border border-primary-500/20 flex items-center justify-center shadow-inner">
                        <Clock size={28} className="text-primary-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-50 to-slate-300 bg-clip-text text-transparent">
                            Quản lý lịch làm việc
                        </h1>
                        <p className="text-sm text-slate-400 font-medium">
                            Thiết lập thời gian khám bệnh và ngày nghỉ của bạn
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {hasChanges && (
                        <div className="hidden md:flex flex-col items-end mr-2 animate-fade-in">
                            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Thay đổi chưa lưu</span>
                            <span className="text-xs text-slate-500">Hãy nhấn lưu để cập nhật</span>
                        </div>
                    )}
                    <Button
                        onClick={handleSave}
                        disabled={!hasChanges || saveStatus !== 'idle'}
                        className={cn(
                            "gap-2 h-11 px-6 font-bold transition-all duration-300",
                            hasChanges ? "bg-primary-600 hover:bg-primary-500 shadow-lg shadow-primary-900/30 ring-2 ring-primary-500/20" : "opacity-60 grayscale-[0.5]"
                        )}
                    >
                        {saveStatus === 'saving' ? <Loading size="sm" variant="white" /> : <Save size={18} />}
                        {saveStatus === 'saving' ? 'Đang lưu...' : 'Lưu lịch làm việc'}
                    </Button>
                </div>
            </div>
            {saveStatus === 'saved' && (
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={14} /> Đã lưu!
                </span>
            )}

            {/* Tab Navigation */}
            <div className="flex items-center gap-1 bg-slate-900 rounded-xl p-1 border border-slate-700 w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                            ? 'bg-primary-600 text-white shadow-lg'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="mt-8">
                {activeTab === 'weekly' && (
                    <WeeklyScheduleTab
                        schedule={schedule}
                        selectedDay={selectedDay}
                        onSelectDay={setSelectedDay}
                        onToggleDay={toggleDay}
                        onOpenCopy={() => setIsCopyModalOpen(true)}
                        onResetDay={handleResetDay}
                    />
                )}

                {activeTab === 'timeslots' && (
                    <TimeSlotsTab
                        schedule={schedule}
                        selectedDay={selectedDay}
                        selectedSchedule={selectedSchedule}
                        onSelectDay={setSelectedDay}
                        onUpdateSlot={updateSlot}
                        onAddSlot={addSlot}
                        onRemoveSlot={removeSlot}
                        onResetDay={handleResetDay}
                    />
                )}

                {activeTab === 'leave' && (
                    <LeaveDaysTab
                        leaveDays={leaveDays}
                        onAddLeave={addLeaveDay}
                        onRemoveLeave={handleRemoveLeaveWithConfirm}
                    />
                )}
            </div>

            {/* Copy Schedule Modal */}
            <Modal
                isOpen={isCopyModalOpen}
                onClose={() => setIsCopyModalOpen(false)}
                title="Sao chép lịch làm việc"
            >
                <div className="space-y-6 pt-2">
                    <p className="text-sm text-slate-400">
                        Sao chép các khung giờ từ {DAYS_VI[selectedDay]} sang các ngày khác.
                    </p>
                    <div className="bg-primary-900/20 border border-primary-800/30 rounded-xl p-4 flex items-start gap-3">
                        <Info size={18} className="text-primary-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-primary-200">
                            Tất cả khung giờ hiện tại của các ngày được chọn sẽ bị thay thế bằng khung giờ của <strong>{DAYS_VI[selectedDay]}</strong>.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {DAYS_VI.map((name, day) => (
                            <button
                                key={day}
                                disabled={day === selectedDay}
                                onClick={() => {
                                    setCopyTargetDays(prev =>
                                        prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
                                    );
                                }}
                                className={cn(
                                    "flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-sm font-medium",
                                    day === selectedDay
                                        ? "bg-slate-800/30 border-slate-700 text-slate-500 cursor-not-allowed"
                                        : copyTargetDays.includes(day)
                                            ? "bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-900/20"
                                            : "bg-slate-900/40 border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-800"
                                )}
                            >
                                {name}
                                {copyTargetDays.includes(day) && <CheckCircle2 size={16} />}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCopyTargetDays(copyTargetDays.length === 6 ? [] : [0, 1, 2, 3, 4, 5, 6].filter(d => d !== selectedDay))}
                        >
                            {copyTargetDays.length === 6 ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                        </Button>
                        <div className="flex gap-3">
                            <Button variant="ghost" onClick={() => setIsCopyModalOpen(false)}>Hủy</Button>
                            <Button
                                variant="primary"
                                onClick={handleCopySchedule}
                                disabled={copyTargetDays.length === 0}
                                className="gap-2"
                            >
                                <Copy size={16} /> Sao chép ngay
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

// ============ Weekly Schedule Tab ============
interface WeeklyTabProps {
    schedule: Schedule[];
    selectedDay: number;
    onSelectDay: (day: number) => void;
    onToggleDay: (day: number) => void;
    onOpenCopy: () => void;
    onResetDay: (day: number) => void;
}

const WeeklyScheduleTab = ({ schedule, selectedDay, onSelectDay, onToggleDay, onOpenCopy, onResetDay }: WeeklyTabProps) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {schedule.map(day => (
            <div
                key={day.dayOfWeek}
                onClick={() => onSelectDay(day.dayOfWeek)}
                className={cn(
                    "group relative overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer",
                    "bg-slate-900/40 backdrop-blur-md border-slate-700/50 hover:bg-slate-800/60 hover:border-slate-600",
                    selectedDay === day.dayOfWeek && "ring-2 ring-primary-500/50 border-primary-500/30 bg-primary-950/20",
                    !day.isAvailable && "opacity-75 grayscale-[0.5]"
                )}
            >
                {/* Header Decoration */}
                <div className={cn(
                    "h-1.5 w-full",
                    day.isAvailable ? "bg-primary-500/50" : "bg-slate-700"
                )} />

                <div className="p-4 pt-5">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                            {DAYS_SHORT[day.dayOfWeek]}
                        </span>
                        {day.isAvailable && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onSelectDay(day.dayOfWeek); onOpenCopy(); }}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-primary-400 hover:bg-primary-900/20 transition-all opacity-0 group-hover:opacity-100"
                                    title="Sao chép lịch này"
                                >
                                    <Copy size={14} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onResetDay(day.dayOfWeek); }}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-900/20 transition-all opacity-0 group-hover:opacity-100"
                                    title="Đặt lại mặc định"
                                >
                                    <RefreshCcw size={14} />
                                </button>
                            </div>
                        )}
                    </div>

                    <h3 className="text-lg font-bold text-slate-50">{DAYS_VI[day.dayOfWeek]}</h3>

                    <div className="mt-4 space-y-3">
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggleDay(day.dayOfWeek); }}
                            className={cn(
                                "w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all",
                                day.isAvailable
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                                    : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700"
                            )}
                        >
                            <span className="flex items-center gap-2">
                                {day.isAvailable ? <CheckCircle2 size={14} /> : <CalendarOff size={14} />}
                                {day.isAvailable ? 'Đang làm việc' : 'Đang nghỉ'}
                            </span>
                            {day.isAvailable ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        </button>

                        {day.isAvailable && (
                            <div className="flex items-center gap-2 px-1">
                                <Badge variant="primary" size="sm" className="bg-primary-500/10 text-primary-400 border-none">
                                    {day.timeSlots.length} khung giờ
                                </Badge>
                                {day.timeSlots.some(s => !s.isAvailable) && (
                                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" title="Có khung giờ bị ẩn" />
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Selected Indicator */}
                {selectedDay === day.dayOfWeek && (
                    <div className="absolute top-0 right-0 p-1">
                        <div className="h-2 w-2 rounded-full bg-primary-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    </div>
                )}
            </div>
        ))}
    </div>
);

// ============ Time Slots Tab ============
interface TimeSlotsTabProps {
    schedule: Schedule[];
    selectedDay: number;
    selectedSchedule?: Schedule;
    onSelectDay: (day: number) => void;
    onUpdateSlot: (day: number, idx: number, updates: Partial<ScheduleTimeSlot>) => void;
    onAddSlot: (day: number) => void;
    onRemoveSlot: (day: number, idx: number) => void;
    onResetDay: (day: number) => void;
}

const TimeSlotsTab = ({ schedule, selectedDay, selectedSchedule, onSelectDay, onUpdateSlot, onAddSlot, onRemoveSlot, onResetDay }: TimeSlotsTabProps) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-3 space-y-3">
                <Card className="bg-slate-900/40 border-slate-700/50">
                    <CardHeader title="Chọn ngày" icon={<Calendar size={18} />} className="pb-2" />
                    <CardContent className="space-y-1">
                        {schedule.map(day => (
                            <button
                                key={day.dayOfWeek}
                                onClick={() => onSelectDay(day.dayOfWeek)}
                                className={cn(
                                    "w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all border group",
                                    selectedDay === day.dayOfWeek
                                        ? "bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-900/20"
                                        : day.isAvailable
                                            ? "bg-slate-800/40 border-slate-700 text-slate-200 hover:border-slate-600 hover:bg-slate-800"
                                            : "bg-slate-900 border-transparent text-slate-600 opacity-60"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "h-2 w-2 rounded-full",
                                        day.isAvailable ? "bg-emerald-500" : "bg-slate-600"
                                    )} />
                                    <span className="font-semibold">{DAYS_VI[day.dayOfWeek]}</span>
                                </div>
                                {day.isAvailable ? (
                                    <span className={cn(
                                        "text-xs font-bold px-2 py-0.5 rounded-lg",
                                        selectedDay === day.dayOfWeek ? "bg-white/20" : "bg-slate-700 text-slate-400"
                                    )}>
                                        {day.timeSlots.length}
                                    </span>
                                ) : (
                                    <CalendarOff size={14} className="text-slate-700" />
                                )}
                            </button>
                        ))}
                    </CardContent>
                </Card>

                {selectedSchedule?.isAvailable && (
                    <div className="p-4 rounded-2xl bg-amber-900/10 border border-amber-900/20">
                        <div className="flex items-center gap-2 text-amber-500 mb-2">
                            <Info size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">Mẹo nhỏ</span>
                        </div>
                        <p className="text-xs text-amber-200/70 leading-relaxed">
                            Bác sĩ nên giữ tối thiểu 15-30 phút cho mỗi khung giờ để đảm bảo chất lượng khám bệnh.
                        </p>
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-9">
                <Card className="bg-slate-900/40 border-slate-700/50 backdrop-blur-md">
                    <CardHeader
                        title={`Lịch khám ${DAYS_VI[selectedDay]}`}
                        description={selectedSchedule?.isAvailable ? "Dưới đây là các khung giờ bệnh nhân có thể đăng ký" : "Ngày này hiện đang nghỉ"}
                        icon={<Clock size={20} className="text-primary-400" />}
                        action={
                            <div className="flex gap-2">
                                {selectedSchedule?.isAvailable && (
                                    <>
                                        <Button variant="ghost" size="sm" onClick={() => onResetDay(selectedDay)} className="text-slate-400 hover:text-amber-400">
                                            <RefreshCcw size={16} className="mr-2" /> Đặt lại
                                        </Button>
                                        <Button variant="primary" size="sm" onClick={() => onAddSlot(selectedDay)} className="shadow-lg shadow-primary-900/20">
                                            <Plus size={16} className="mr-2" /> Thêm khung giờ
                                        </Button>
                                    </>
                                )}
                            </div>
                        }
                    />
                    <CardContent>
                        {selectedSchedule?.isAvailable ? (
                            <div className="space-y-4">
                                {selectedSchedule.timeSlots.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedSchedule.timeSlots.map((slot, idx) => (
                                            <div
                                                key={idx}
                                                className={cn(
                                                    "relative p-4 rounded-2xl border transition-all duration-300",
                                                    slot.isAvailable
                                                        ? "bg-slate-800/60 border-slate-700/50 hover:border-primary-500/30 group/slot"
                                                        : "bg-slate-900/50 border-slate-800 opacity-60"
                                                )}
                                            >
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                        Khung giờ #{idx + 1}
                                                    </span>
                                                    <button
                                                        onClick={() => onRemoveSlot(selectedDay, idx)}
                                                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-900/20 transition-all opacity-0 group-hover/slot:opacity-100"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Bắt đầu</label>
                                                        <div className="relative">
                                                            <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                                            <input
                                                                type="time"
                                                                value={slot.startTime}
                                                                onChange={(e) => onUpdateSlot(selectedDay, idx, { startTime: e.target.value })}
                                                                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all font-medium"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Kết thúc</label>
                                                        <div className="relative">
                                                            <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                                            <input
                                                                type="time"
                                                                value={slot.endTime}
                                                                onChange={(e) => onUpdateSlot(selectedDay, idx, { endTime: e.target.value })}
                                                                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all font-medium"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-bold text-slate-500 uppercase">Tối đa BN</span>
                                                            <input
                                                                type="number"
                                                                min={1}
                                                                max={20}
                                                                value={slot.maxPatients}
                                                                onChange={(e) => onUpdateSlot(selectedDay, idx, { maxPatients: Number(e.target.value) })}
                                                                className="bg-transparent text-sm font-bold text-primary-400 w-12 focus:outline-none"
                                                            />
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => onUpdateSlot(selectedDay, idx, { isAvailable: !slot.isAvailable })}
                                                        className={cn(
                                                            "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all",
                                                            slot.isAvailable
                                                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                                : "bg-slate-700 text-slate-400 border border-slate-600"
                                                        )}
                                                    >
                                                        {slot.isAvailable ? 'Sẵn sàng' : 'Không nhận'}
                                                        {slot.isAvailable ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 bg-slate-900/30 rounded-3xl border border-dashed border-slate-700">
                                        <div className="h-16 w-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                                            <Clock size={32} className="text-slate-600" />
                                        </div>
                                        <h4 className="text-slate-100 font-bold mb-1">Chưa có khung giờ khám</h4>
                                        <p className="text-slate-500 text-sm mb-6">Hãy thêm khung giờ để bệnh nhân có thể đặt lịch.</p>
                                        <Button onClick={() => onAddSlot(selectedDay)} className="gap-2">
                                            <Plus size={18} /> Thêm khung giờ đầu tiên
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="h-20 w-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-6">
                                    <CalendarOff size={40} className="text-slate-600" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-200 mb-2">Ngày nghỉ làm việc</h4>
                                <p className="text-slate-500 text-center max-w-xs">
                                    Bạn đã cài đặt nghỉ vào ngày này. Hãy bật "Làm việc" ở tab Lịch tuần để mở lại khung giờ khám.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

// ============ Leave Days Tab ============
interface LeaveDaysTabProps {
    leaveDays: LeaveDay[];
    onAddLeave: (date: string, reason: string) => void;
    onRemoveLeave: (date: string) => void;
}

const LeaveDaysTab = ({ leaveDays, onAddLeave, onRemoveLeave }: LeaveDaysTabProps) => {
    const [newDate, setNewDate] = useState('');
    const [newReason, setNewReason] = useState('');
    const today = new Date().toISOString().split('T')[0];

    // Group leave days
    const { upcoming, past } = useMemo(() => {
        const sorted = [...leaveDays].sort((a, b) => a.date.localeCompare(b.date));
        return {
            upcoming: sorted.filter(ld => ld.date >= today),
            past: sorted.filter(ld => ld.date < today).reverse() // Past in reverse order (nearest first)
        };
    }, [leaveDays, today]);

    const handleAdd = () => {
        if (!newDate) return;
        onAddLeave(newDate, newReason);
        setNewDate('');
        setNewReason('');
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Section */}
            <div className="lg:col-span-4 space-y-6">
                <Card className="bg-slate-900/40 border-slate-700/50 backdrop-blur-md overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Plus size={80} className="text-primary-500" />
                    </div>
                    <CardHeader
                        title="Thêm ngày nghỉ"
                        description="Khóa các khung giờ khám trong ngày này"
                        icon={<CalendarOff size={22} className="text-red-400" />}
                    />
                    <CardContent className="space-y-6 pt-2">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Calendar size={14} className="text-primary-500/50" /> Chọn ngày nghỉ
                            </label>
                            <input
                                type="date"
                                min={today}
                                value={newDate}
                                onChange={(e) => setNewDate(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Info size={14} className="text-primary-500/50" /> Lý do nghỉ
                            </label>
                            <textarea
                                value={newReason}
                                onChange={(e) => setNewReason(e.target.value)}
                                placeholder="VD: Nghỉ phép, đi học, hội thảo..."
                                className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-50 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all resize-none h-32"
                            />
                        </div>

                        <Button
                            className="w-full h-12 shadow-lg shadow-primary-900/20 group font-bold"
                            onClick={handleAdd}
                            disabled={!newDate}
                            variant="primary"
                        >
                            <Plus size={20} className="mr-2 group-hover:rotate-90 transition-transform" />
                            Xác nhận thêm ngày nghỉ
                        </Button>
                    </CardContent>
                </Card>

                <div className="p-5 rounded-2xl bg-amber-900/10 border border-amber-900/20 flex gap-4">
                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                        <AlertCircle size={20} className="text-amber-400" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-amber-500 mb-1">Lưu ý quan quan trọng</h4>
                        <p className="text-xs text-amber-200/60 leading-relaxed">
                            Khi thêm ngày nghỉ, tất cả các khung giờ khám hiện có trong ngày đó sẽ bị ẩn và bệnh nhân không thể đặt lịch.
                        </p>
                    </div>
                </div>
            </div>

            {/* List Section */}
            <div className="lg:col-span-8 space-y-8">
                {/* Upcoming Leaves */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <h3 className="text-lg font-bold text-slate-50">Ngày nghỉ sắp tới</h3>
                            <Badge variant="primary" size="sm" className="bg-primary-500/10 text-primary-400 border-none px-2.5">
                                {upcoming.length} ngày
                            </Badge>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {upcoming.map((leave: LeaveDay) => {
                            const dateObj = new Date(leave.date + 'T00:00:00');
                            const isToday = leave.date === today;

                            return (
                                <div
                                    key={leave.date}
                                    className={cn(
                                        "group relative flex flex-col p-5 rounded-3xl border transition-all duration-300",
                                        isToday
                                            ? "bg-primary-950/20 border-primary-500/30 ring-1 ring-primary-500/20 shadow-lg shadow-primary-900/10"
                                            : "bg-slate-900/40 border-slate-700/50 backdrop-blur-md hover:bg-slate-800/60 hover:border-slate-600"
                                    )}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={cn(
                                            "h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner",
                                            isToday ? "bg-primary-500 text-white" : "bg-red-500/10 text-red-400"
                                        )}>
                                            <CalendarOff size={22} />
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            {isToday ? (
                                                <Badge className="bg-emerald-500 text-white border-none animate-pulse">Hôm nay</Badge>
                                            ) : (
                                                <Badge variant="info" className="bg-slate-700/30 text-slate-400 italic font-medium px-2 py-0.5 rounded-lg">Sắp tới</Badge>
                                            )}
                                            <button
                                                onClick={() => onRemoveLeave(leave.date)}
                                                className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100"
                                                title="Hủy ngày nghỉ"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-lg font-bold text-slate-50 mb-1">
                                            {dateObj.toLocaleDateString('vi-VN', { weekday: 'long' })}
                                        </p>
                                        <p className="text-2xl font-black text-slate-100 tracking-tight">
                                            {dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                        </p>
                                        {leave.reason && (
                                            <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-start gap-2">
                                                <Info size={14} className="text-slate-500 shrink-0 mt-0.5" />
                                                <p className="text-xs text-slate-400 font-medium italic line-clamp-2">
                                                    {leave.reason}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Selection Glow */}
                                    {isToday && (
                                        <div className="absolute -z-10 inset-0 bg-primary-500/10 blur-2xl rounded-full scale-75 opacity-50" />
                                    )}
                                </div>
                            );
                        })}

                        {upcoming.length === 0 && (
                            <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center py-16 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
                                <div className="h-14 w-14 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                                    <CalendarOff size={24} className="text-slate-600" />
                                </div>
                                <h4 className="text-slate-200 font-bold mb-1">Không có ngày nghỉ sắp tới</h4>
                                <p className="text-slate-500 text-sm">Lịch làm việc của bạn đang hoạt động bình thường.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Past Leaves */}
                {past.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-slate-800/50">
                        <div className="flex items-center gap-3 px-2">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Lịch sử ngày nghỉ</h3>
                            <span className="h-px flex-1 bg-slate-800/50" />
                        </div>

                        <div className="space-y-2">
                            {past.map((leave: LeaveDay) => (
                                <div
                                    key={leave.date}
                                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/20 border border-slate-800/50 opacity-60 hover:opacity-80 transition-opacity"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center">
                                            <CalendarOff size={16} className="text-slate-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-200">
                                                {new Date(leave.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                            </p>
                                            <p className="text-[11px] text-slate-500 italic mt-0.5">{leave.reason || 'Không rõ lý do'}</p>
                                        </div>
                                    </div>
                                    <Badge variant="info" className="text-[10px] bg-slate-800 text-slate-600 uppercase border-none px-2 py-1 rounded-md">Đã qua</Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SchedulePage;
