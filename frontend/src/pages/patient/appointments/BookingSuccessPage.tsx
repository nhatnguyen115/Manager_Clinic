import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Calendar, LayoutDashboard, ArrowRight, Clock, User, Stethoscope, Bell } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Card, CardContent } from '@components/ui/Card';

const BookingSuccessPage = () => {
    const location = useLocation();
    const bookingInfo = location.state as {
        doctorName?: string;
        date?: string;
        time?: string;
        specialty?: string;
    } | null;

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 animate-fade-in">
            {/* Celebration Header */}
            <div className="relative">
                {/* Decorative rings */}
                <div className="absolute inset-0 -m-6 rounded-full border-2 border-dashed border-success/20 animate-spin" style={{ animationDuration: '20s' }} />
                <div className="absolute inset-0 -m-3 rounded-full border border-success/10" />
                <div className="h-24 w-24 bg-success/10 rounded-full flex items-center justify-center border border-success/20 animate-scale-in-bounce">
                    <CheckCircle2 className="text-success" size={56} />
                </div>
            </div>

            <div className="text-center space-y-3 max-w-md mt-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <h1 className="text-4xl font-black text-slate-50">Đặt lịch thành công!</h1>
                <p className="text-slate-400 text-lg leading-relaxed">
                    Lịch hẹn của bạn đã được ghi nhận. Phòng khám sẽ xác nhận trong thời gian sớm nhất.
                </p>
            </div>

            {/* Booking Summary Card */}
            {bookingInfo && (bookingInfo.doctorName || bookingInfo.date) && (
                <Card className="mt-8 w-full max-w-md border-primary-500/20 animate-fade-in-up" style={{ animationDelay: '350ms' }}>
                    <CardContent className="p-6">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Thông tin lịch hẹn</h3>
                        <div className="space-y-3">
                            {bookingInfo.doctorName && (
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-primary-900/30 flex items-center justify-center text-primary-400">
                                        <User size={16} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Bác sĩ</p>
                                        <p className="text-sm font-semibold text-slate-50">{bookingInfo.doctorName}</p>
                                    </div>
                                </div>
                            )}
                            {bookingInfo.specialty && (
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-blue-900/30 flex items-center justify-center text-blue-400">
                                        <Stethoscope size={16} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Chuyên khoa</p>
                                        <p className="text-sm font-semibold text-slate-50">{bookingInfo.specialty}</p>
                                    </div>
                                </div>
                            )}
                            {bookingInfo.date && (
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-emerald-900/30 flex items-center justify-center text-emerald-400">
                                        <Calendar size={16} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Ngày khám</p>
                                        <p className="text-sm font-semibold text-slate-50">
                                            {new Date(bookingInfo.date).toLocaleDateString('vi-VN', {
                                                weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {bookingInfo.time && (
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-amber-900/30 flex items-center justify-center text-amber-400">
                                        <Clock size={16} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Giờ khám</p>
                                        <p className="text-sm font-semibold text-slate-50">{bookingInfo.time}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full max-w-md animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                <Link to="/dashboard" className="flex-1">
                    <Button variant="outline" fullWidth className="h-12 border-slate-700 hover:bg-slate-800">
                        <LayoutDashboard size={18} className="mr-2" /> Bảng điều khiển
                    </Button>
                </Link>
                <Link to="/appointments" className="flex-1">
                    <Button fullWidth className="h-12 bg-primary-600 hover:bg-primary-500 shadow-xl shadow-primary-900/20">
                        Lịch hẹn của tôi <ArrowRight size={18} className="ml-2" />
                    </Button>
                </Link>
            </div>

            {/* What Happens Next Timeline */}
            <div className="mt-12 w-full max-w-md animate-fade-in-up" style={{ animationDelay: '650ms' }}>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 text-center">Tiếp theo là gì?</h3>
                <div className="space-y-0">
                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-success/20 border-2 border-success flex items-center justify-center">
                                <CheckCircle2 size={14} className="text-success" />
                            </div>
                            <div className="w-0.5 h-8 bg-slate-700" />
                        </div>
                        <div className="pb-6">
                            <p className="text-sm font-semibold text-slate-50">Đã đặt lịch</p>
                            <p className="text-xs text-slate-500 mt-0.5">Lịch hẹn đã được ghi nhận vào hệ thống</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center">
                                <Bell size={14} className="text-amber-400" />
                            </div>
                            <div className="w-0.5 h-8 bg-slate-700" />
                        </div>
                        <div className="pb-6">
                            <p className="text-sm font-semibold text-slate-100">Chờ xác nhận</p>
                            <p className="text-xs text-slate-500 mt-0.5">Phòng khám sẽ xác nhận lịch hẹn qua thông báo</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center">
                                <Calendar size={14} className="text-slate-500" />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-300">Ngày khám bệnh</p>
                            <p className="text-xs text-slate-500 mt-0.5">Đến đúng giờ và mang theo giấy tờ cần thiết</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingSuccessPage;
