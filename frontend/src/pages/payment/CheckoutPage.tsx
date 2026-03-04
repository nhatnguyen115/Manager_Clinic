import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    CreditCard,
    ChevronLeft,
    ShieldCheck,
    AlertCircle,
    Calendar,
    Clock,
    User,
    Stethoscope
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Loading } from '@components/ui/Loading';
import { getAppointmentById } from '@services/patientService';
import paymentService from '@services/paymentService';
import { toast } from 'react-hot-toast';
import type { AppointmentResponse } from '@/types';

const CheckoutPage = () => {
    const { appointmentId } = useParams<{ appointmentId: string }>();
    const navigate = useNavigate();
    const [appointment, setAppointment] = useState<AppointmentResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const loadAppointment = async () => {
            try {
                setLoading(true);
                const found = await getAppointmentById(appointmentId!);

                if (!found) {
                    toast.error('Không tìm thấy thông tin lịch hẹn');
                    navigate('/appointments');
                    return;
                }

                if (found.status === 'CANCELLED') {
                    toast.error('Lịch hẹn này đã bị hủy, không thể thanh toán');
                    navigate(`/appointments/${appointmentId}`);
                    return;
                }

                setAppointment(found);
            } catch (error) {
                console.error('Failed to load appointment:', error);
                toast.error('Không tìm thấy thông tin lịch hẹn');
                navigate('/appointments');
            } finally {
                setLoading(false);
            }
        };

        if (appointmentId) loadAppointment();
    }, [appointmentId, navigate]);

    const handlePayment = async () => {
        if (!appointmentId) return;

        try {
            setProcessing(true);
            const response = await paymentService.createPaymentUrl(appointmentId);

            if (response.result?.paymentUrl) {
                toast.success('Đang chuyển hướng đến cổng thanh toán VNPay...');
                window.location.href = response.result.paymentUrl;
            } else {
                throw new Error('Không nhận được link thanh toán');
            }
        } catch (error) {
            console.error('Payment error:', error);
            toast.error('Có lỗi xảy ra khi tạo link thanh toán. Vui lòng thử lại.');
        } finally {
            setProcessing(false);
        }
    };


    if (loading) return <Loading fullPage text="Đang chuẩn bị thanh toán..." />;
    if (!appointment) return null;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
            <div className="flex items-center gap-2 mb-6">
                <Link to={`/appointments/${appointmentId}`}>
                    <Button variant="ghost" size="sm" className="text-dark-400 hover:text-dark-50 -ml-2">
                        <ChevronLeft size={18} className="mr-1" /> Quay lại chi tiết
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Summary */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="overflow-hidden border-primary-900/20">
                        <CardHeader
                            title="Xác nhận thanh toán"
                            icon={<CreditCard className="text-primary-400" size={20} />}
                            className="bg-primary-900/10"
                        />
                        <CardContent className="p-6">
                            <div className="space-y-6">
                                <div className="flex items-start gap-4 p-4 bg-dark-800/40 rounded-2xl border border-dark-700/50">
                                    <div className="w-12 h-12 bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-400">
                                        <Stethoscope size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-dark-50 text-lg">Dịch vụ khám bệnh</h3>
                                        <p className="text-dark-400 text-sm">{appointment.specialtyName}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 text-dark-300">
                                        <User size={18} className="text-dark-500" />
                                        <span className="text-sm">Bác sĩ: <strong>{appointment.doctorName}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-3 text-dark-300">
                                        <Calendar size={18} className="text-dark-500" />
                                        <span className="text-sm">Ngày: <strong>{new Date(appointment.appointmentDate).toLocaleDateString('vi-VN')}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-3 text-dark-300">
                                        <Clock size={18} className="text-dark-500" />
                                        <span className="text-sm">Giờ: <strong>{appointment.appointmentTime}</strong></span>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-dark-700/50">
                                    <h4 className="text-sm font-semibold text-dark-400 uppercase tracking-wider mb-4">Phương thức thanh toán</h4>
                                    <div className="flex items-center justify-between p-4 bg-primary-900/10 border border-primary-500/30 rounded-2xl">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-2">
                                                <img src="https://sandbox.vnpayment.vn/paymentv2/Images/brands/logo-vnpay.png" alt="VNPay" className="max-h-full object-contain" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-dark-50">Cổng thanh toán VNPay</p>
                                                <p className="text-xs text-dark-400">Thẻ ATM / QR Code / Visa / Master</p>
                                            </div>
                                        </div>
                                        <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                                            <ShieldCheck size={16} className="text-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center gap-3 p-4 bg-amber-900/10 border border-amber-800/20 rounded-2xl text-amber-500 text-sm">
                        <AlertCircle size={18} />
                        <p>Vui lòng thanh toán để xác nhận lịch hẹn chính thức với bác sĩ.</p>
                    </div>
                </div>

                {/* Right Column: Order Summary */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-6 border-primary-900/20">
                        <CardHeader title="Tóm tắt đơn hàng" />
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-dark-300">
                                    <span className="text-sm">Giá dịch vụ</span>
                                    <span className="font-medium text-dark-100">{appointment.consultationFee?.toLocaleString('vi-VN')} đ</span>
                                </div>
                                <div className="flex justify-between items-center text-dark-300 pb-4 border-b border-dark-700/50">
                                    <span className="text-sm">Phí giao dịch</span>
                                    <span className="font-medium text-dark-100">Miễn phí</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="font-bold text-dark-50">Tổng thanh toán</span>
                                    <span className="text-xl font-black text-primary-400">
                                        {appointment.consultationFee?.toLocaleString('vi-VN')} đ
                                    </span>
                                </div>

                                <div className="pt-6">
                                    <Button
                                        fullWidth
                                        size="lg"
                                        className="bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-900/20 h-14 text-lg font-bold"
                                        onClick={handlePayment}
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Đang xử lý...
                                            </div>
                                        ) : (
                                            'Xác nhận & Thanh toán'
                                        )}
                                    </Button>
                                </div>

                                <p className="text-[10px] text-dark-500 text-center mt-4">
                                    Bằng cách nhấn thanh toán, bạn đồng ý với các Điều khoản & Chính sách của ClinicPro.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
