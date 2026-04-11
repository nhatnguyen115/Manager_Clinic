import { useState, useEffect, useMemo } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Info,
    Calendar,
    Clock,
    Loader2,
    ArrowRight,
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
    StickyNote
} from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Card, CardHeader, CardContent } from '@components/ui/Card';
import { useToast } from '@hooks/useToast';
import { getDoctorById, createAppointment } from '@services/patientService';
import type { DoctorResponse } from '@/types';
import { BookingStepper } from '@components/appointments/BookingStepper';
import { Avatar } from '@components/ui/Avatar';

const ConfirmBookingPage = () => {
    const { specialtyId, doctorId } = useParams<{ specialtyId: string; doctorId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const { showToast } = useToast();

    // Memoize bookingData to prevent infinite re-renders
    const bookingData = useMemo(() => {
        return location.state as { date: string; time: string; timeSlotId: number } | null;
    }, [location.state]);

    const [doctor, setDoctor] = useState<DoctorResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [symptoms, setSymptoms] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (!doctorId || !bookingData) {
            navigate('/booking/specialty');
            return;
        }

        const load = async () => {
            try {
                setIsLoading(true);
                const data = await getDoctorById(doctorId);
                setDoctor(data);
            } catch (error) {
                console.error('Failed to load doctor details:', error);
                showToast.error('Không thể tải thông tin bác sĩ. Vui lòng thử lại.');
            } finally {
                setIsLoading(false);
            }
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [doctorId]);

    const handleConfirm = async () => {
        if (!bookingData || !doctor) return;
        if (!symptoms.trim()) {
            showToast.error('Vui lòng nhập triệu chứng để bác sĩ chuẩn bị trước.');
            return;
        }

        try {
            setIsSubmitting(true);
            showToast.loading('Đang đặt lịch hẹn...');

            await createAppointment({
                doctorId: doctor.id,
                specialtyId: specialtyId || undefined,
                timeSlotId: bookingData.timeSlotId,
                appointmentDate: bookingData.date,
                symptoms: symptoms.trim(),
                notes: notes.trim() || undefined,
            });

            showToast.dismiss();
            showToast.success('Đặt lịch thành công!');

            navigate('/booking/success', {
                state: {
                    doctorName: doctor.fullName,
                    date: bookingData.date,
                    time: bookingData.time,
                    specialty: doctor.specialtyName
                }
            });
        } catch (error: any) {
            showToast.dismiss();
            const msg = error.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';
            showToast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 size={48} className="animate-spin text-primary-500" />
                <p className="text-slate-400 font-medium animate-pulse">Đang chuẩn bị hồ sơ đặt lịch...</p>
            </div>
        );
    }

    if (!bookingData || !doctor) {
        return <div className="text-center py-20 text-slate-400">Trạng thái đặt lịch không hợp lệ hoặc thông tin bác sĩ không có sẵn.</div>;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-20 px-4 sm:px-0">
            <BookingStepper currentStep={4} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Information Summary */}
                <div className="lg:col-span-8 space-y-8">
                    <section className="space-y-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 h-auto text-slate-500 hover:text-primary-400 group flex items-center bg-transparent"
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeft size={16} className="mr-2 transition-transform group-hover:-translate-x-1" />
                            Quay lại chọn thời gian
                        </Button>
                        <h1 className="text-4xl font-extrabold text-slate-50 tracking-tight">Xác nhận lịch hẹn</h1>
                        <p className="text-slate-400 text-lg">
                            Vui lòng kiểm tra lại thông tin và xác nhận để hoàn tất đặt lịch.
                        </p>
                    </section>

                    <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-sm overflow-hidden">
                        <CardHeader
                            title="Thông tin cuộc hẹn"
                            icon={<Info size={20} className="text-primary-400" />}
                            className="bg-slate-900 border-b border-slate-700/50"
                        />
                        <CardContent className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Doctor Info */}
                                <div className="flex gap-4 p-4 bg-slate-800/40 rounded-2xl border border-slate-700/30">
                                    <Avatar
                                        src={doctor?.avatarUrl}
                                        fallback={doctor?.fullName[0] || 'D'}
                                        size="xl"
                                        className="rounded-2xl shrink-0"
                                    />
                                    <div className="space-y-1 pt-1">
                                        <p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">Bác sĩ phụ trách</p>
                                        <h3 className="text-lg font-bold text-slate-50">{doctor?.fullName}</h3>
                                        <p className="text-slate-400 text-sm">{doctor?.specialtyName}</p>
                                    </div>
                                </div>

                                {/* Time Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/30">
                                        <p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest mb-2">Ngày khám</p>
                                        <div className="flex items-center gap-2 text-slate-50">
                                            <Calendar size={18} className="text-primary-400" />
                                            <span className="font-bold">{new Date(bookingData.date).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/30">
                                        <p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest mb-2">Thời gian</p>
                                        <div className="flex items-center gap-2 text-slate-50">
                                            <Clock size={18} className="text-primary-400" />
                                            <span className="font-bold">{bookingData.time}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 space-y-8">
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
                                        <CheckCircle2 size={14} className="text-primary-500" />
                                        Triệu chứng / Lý do khám
                                    </label>
                                    <textarea
                                        className="w-full bg-slate-800/50 border-2 border-slate-700 rounded-2xl px-5 py-4 text-slate-100 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all min-h-[120px] resize-none"
                                        placeholder="Mô tả ngắn gọn các triệu chứng bạn đang gặp phải..."
                                        value={symptoms}
                                        onChange={(e) => setSymptoms(e.target.value)}
                                        maxLength={500}
                                    />
                                    <div className="flex justify-end pr-2">
                                        <span className={`text-[10px] font-medium ${symptoms.length > 450 ? 'text-amber-500' : 'text-slate-500'}`}>
                                            {symptoms.length}/500 ký tự
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
                                        <StickyNote size={14} className="text-primary-500" />
                                        Ghi chú thêm (Không bắt buộc)
                                    </label>
                                    <textarea
                                        className="w-full bg-slate-800/50 border-2 border-slate-700 rounded-2xl px-5 py-3 text-slate-100 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all min-h-[80px] resize-none"
                                        placeholder="Ví dụ: Dị ứng thuốc, tiền sử bệnh lý..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        maxLength={300}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Checkout Column */}
                <div className="lg:col-span-4 lg:sticky lg:top-8 self-start">
                    <Card className="border-slate-800 bg-slate-900 border-2 border-primary-500/20 shadow-2xl shadow-primary-900/10 overflow-hidden">
                        <div className="p-8 space-y-8">
                            <h3 className="text-xl font-bold text-slate-50 flex items-center gap-2">
                                <ShieldCheck size={24} className="text-primary-500" />
                                Thông tin thanh toán
                            </h3>

                            <div className="space-y-4 pt-4 border-t border-slate-800/50">
                                <div className="flex justify-between text-slate-400">
                                    <span>Chi phí khám</span>
                                    <span className="text-slate-100 font-medium">Bác sĩ sẽ cập nhật sau khi khám</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>Thanh toán</span>
                                    <span className="text-slate-100 font-medium text-green-500">Thực hiện sau khi có bệnh án</span>
                                </div>

                                <div className="pt-6 border-t border-slate-800 flex justify-between items-end">
                                    <span className="text-slate-100 font-bold">Trạng thái phí khám</span>
                                    <div className="text-right">
                                        <p className="text-xl font-black text-primary-400 tracking-tighter">Chưa chốt</p>
                                        <p className="text-[10px] text-slate-500 italic mt-1">(Bệnh nhân chỉ thanh toán sau khi bác sĩ khám xong)</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-primary-500/5 p-4 rounded-2xl border border-primary-500/10 space-y-3">
                                <div className="flex items-start gap-3">
                                    <AlertCircle size={18} className="text-primary-400 shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                                        Bằng cách nhấn xác nhận, bạn đồng ý với <strong>Điều khoản dịch vụ</strong> và <strong>Chính sách bảo mật</strong> của ClinicPro.
                                    </p>
                                </div>
                            </div>

                            <Button
                                size="lg"
                                className="w-full h-16 rounded-2xl text-lg font-black shadow-xl shadow-primary-900/40 relative group overflow-hidden"
                                onClick={handleConfirm}
                                isLoading={isSubmitting}
                                disabled={isSubmitting || !symptoms.trim()}
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    Xác nhận ngay
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Button>

                            <p className="text-center text-[10px] text-slate-500 font-medium">
                                Đảm bảo thông tin chính xác để bác sĩ phục vụ tốt nhất
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ConfirmBookingPage;
