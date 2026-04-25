import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar as CalendarIcon, Clock, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Card, CardHeader, CardContent } from '@components/ui/Card';
import { TimeSlotPicker } from '@components/appointments/TimeSlotPicker';
import { getAvailableSlots } from '@services/patientService';
import type { TimeSlotResponse } from '@/types';

import { BookingStepper } from '@components/appointments/BookingStepper';
import { SlotSkeleton } from '@components/appointments/BookingSkeletons';

const SelectDateTimePage = () => {
    const { specialtyId, doctorId } = useParams<{ specialtyId: string; doctorId: string }>();
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [selectedSlot, setSelectedSlot] = useState<string>();
    const [selectedSlotId, setSelectedSlotId] = useState<number>();
    const [slots, setSlots] = useState<TimeSlotResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!doctorId || !selectedDate) return;
        const load = async () => {
            try {
                setIsLoading(true);
                setSelectedSlot(undefined);
                setSelectedSlotId(undefined);
                const data = await getAvailableSlots(doctorId, selectedDate);
                setSlots(data);
            } catch (error) {
                console.error('Failed to load slots:', error);
                setSlots([]);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [doctorId, selectedDate]);

    // Split into AM/PM groups
    const { morningSlots, afternoonSlots } = useMemo(() => {
        const morning: string[] = [];
        const afternoon: string[] = [];
        const disabledSet = new Set<string>();

        slots.forEach(s => {
            const time = s.startTime; // "HH:mm"
            const hour = parseInt(time.split(':')[0], 10);
            if (hour < 12) {
                morning.push(time);
            } else {
                afternoon.push(time);
            }
            if (!s.isAvailable) {
                disabledSet.add(time);
            }
        });

        return {
            morningSlots: morning,
            afternoonSlots: afternoon,
            disabledSlots: disabledSet,
        };
    }, [slots]);

    const disabledSlots = useMemo(() =>
        slots.filter(s => !s.isAvailable).map(s => s.startTime),
        [slots]
    );

    const handleSlotSelect = (time: string) => {
        setSelectedSlot(time);
        const slot = slots.find(s => s.startTime === time);
        setSelectedSlotId(slot?.id);
    };

    const handleNext = () => {
        if (selectedDate && selectedSlot && selectedSlotId !== undefined) {
            navigate(`/booking/confirm/${specialtyId}/${doctorId}`, {
                state: { date: selectedDate, time: selectedSlot, timeSlotId: selectedSlotId }
            });
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-20 px-4 sm:px-0">
            <BookingStepper currentStep={3} />

            <section className="space-y-4">
                <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-auto text-slate-500 hover:text-primary-400 group flex items-center bg-transparent"
                    onClick={() => navigate(`/booking/doctor/${specialtyId}`)}
                >
                    <ArrowLeft size={16} className="mr-2 transition-transform group-hover:-translate-x-1" />
                    Quay lại chọn bác sĩ
                </Button>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-extrabold text-slate-50 tracking-tight">Lịch khám bác sĩ</h1>
                        <p className="text-slate-400 text-lg">
                            Chọn thời gian thuận tiện nhất cho buổi khám của bạn.
                        </p>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Date Selection Panel */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-sm overflow-hidden sticky top-8">
                        <CardHeader
                            title="Ngày khám bệnh"
                            icon={<CalendarIcon size={20} className="text-primary-400" />}
                            className="bg-slate-900 border-b border-slate-700/50"
                        />
                        <CardContent className="p-6">
                            <input
                                type="date"
                                className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-5 py-4 text-slate-50 font-bold focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all cursor-pointer"
                                value={selectedDate}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                            <div className="mt-8 space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">Thông tin lịch khám</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm text-slate-200 bg-success/5 p-3 rounded-xl border border-success/10">
                                        <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                                        <span>Đầy đủ khung giờ trống</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-200 bg-primary-500/5 p-3 rounded-xl border border-primary-500/10">
                                        <div className="h-2 w-2 rounded-full bg-primary-500" />
                                        <span>Khám trực tiếp tại phòng khám</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Time Slot Selection Panel */}
                <div className="lg:col-span-8 space-y-6">
                    <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-sm overflow-hidden">
                        <CardHeader
                            title="Các khung giờ còn trống"
                            icon={<Clock size={20} className="text-primary-400" />}
                            className="bg-slate-900 border-b border-slate-700/50"
                        />
                        <CardContent className="p-8">
                            {isLoading ? (
                                <SlotSkeleton />
                            ) : slots.length === 0 ? (
                                <div className="text-center py-20 bg-slate-800/20 rounded-3xl border border-dashed border-slate-800">
                                    <div className="h-20 w-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-500">
                                        <CalendarIcon size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-200">Không có lịch trống</h3>
                                    <p className="text-slate-500 mt-2 max-w-xs mx-auto">
                                        Bác sĩ hiện đã kín lịch trong ngày này. Vui lòng chọn một ngày khác.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-12">
                                    {morningSlots.length > 0 && (
                                        <section>
                                            <div className="flex items-center gap-2 mb-6 text-slate-300 font-bold uppercase tracking-widest text-xs">
                                                <div className="h-1 w-8 bg-primary-500 rounded-full" />
                                                <span>Buổi sáng</span>
                                            </div>
                                            <TimeSlotPicker
                                                slots={morningSlots}
                                                selectedSlot={selectedSlot}
                                                onSelect={handleSlotSelect}
                                                disabledSlots={disabledSlots}
                                            />
                                        </section>
                                    )}
                                    {afternoonSlots.length > 0 && (
                                        <section>
                                            <div className="flex items-center gap-2 mb-6 text-slate-300 font-bold uppercase tracking-widest text-xs">
                                                <div className="h-1 w-8 bg-primary-500 rounded-full" />
                                                <span>Buổi chiều</span>
                                            </div>
                                            <TimeSlotPicker
                                                slots={afternoonSlots}
                                                selectedSlot={selectedSlot}
                                                onSelect={handleSlotSelect}
                                                disabledSlots={disabledSlots}
                                            />
                                        </section>
                                    )}
                                </div>
                            )}

                            <div className="mt-12 pt-8 border-t border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div className="text-sm">
                                    {selectedSlot ? (
                                        <div className="flex items-center gap-2 text-primary-400 font-bold">
                                            <CheckCircle2 size={16} />
                                            Đã chọn: {selectedSlot} • {new Date(selectedDate).toLocaleDateString('vi-VN')}
                                        </div>
                                    ) : (
                                        <span className="text-slate-500 italic">Vui lòng chọn khung giờ phù hợp</span>
                                    )}
                                </div>
                                <Button
                                    size="lg"
                                    className="px-12 py-7 rounded-2xl text-base font-black shadow-2xl shadow-primary-900/30 w-full sm:w-auto hover:translate-y-[-2px] active:translate-y-0 transition-transform"
                                    disabled={!selectedSlot}
                                    onClick={handleNext}
                                >
                                    Tiếp tục xác nhận <ArrowRight size={20} className="ml-2" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SelectDateTimePage;
