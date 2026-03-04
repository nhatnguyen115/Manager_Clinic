import { useEffect, useState } from 'react';
import {
    CreditCard,
    Calendar,
    User,
    ChevronRight,
    CheckCircle2,
    XCircle,
    Clock,
    Filter,
    Search,
    FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { Loading } from '@components/ui/Loading';
import { paymentService, PaymentResponse } from '@services/paymentService';
import { toast } from 'react-hot-toast';

const PaymentHistoryPage = () => {
    const [payments, setPayments] = useState<PaymentResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await paymentService.getPaymentHistory();
            if (response.result) {
                setPayments(response.result);
            }
        } catch (error) {
            console.error('Fetch payment history error:', error);
            toast.error('Không thể tải lịch sử giao dịch');
        } finally {
            setLoading(false);
        }
    };

    const statusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <Badge variant="success" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Đã thanh toán</Badge>;
            case 'FAILED':
                return <Badge variant="error" className="bg-red-500/10 text-red-500 border-red-500/20">Thất bại</Badge>;
            case 'PENDING':
                return <Badge variant="warning" className="bg-amber-500/10 text-amber-500 border-amber-500/20">Chưa thanh toán</Badge>;
            default:
                return <Badge variant="default">{status}</Badge>;
        }
    };

    const filteredPayments = payments.filter(p =>
        p.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.transactionId?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <Loading fullPage text="Đang tải lịch sử giao dịch..." />;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-dark-50 tracking-tight">Hóa đơn & Thanh toán</h1>
                    <p className="text-dark-400 mt-1">Quản lý các hóa đơn và lịch sử giao dịch của bạn</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm theo bác sĩ hoặc mã giao dịch..."
                        className="w-full bg-dark-800 border border-dark-700/50 rounded-xl py-2.5 pl-10 pr-4 text-dark-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all placeholder:text-dark-600"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="sm:w-32">
                    <Filter size={18} className="mr-2" /> Lọc
                </Button>
            </div>

            <div className="space-y-4">
                {filteredPayments.length > 0 ? (
                    filteredPayments.map((payment) => (
                        <Card key={payment.paymentId} className="group hover:border-dark-600/50 transition-all duration-300 overflow-hidden border-dark-700/30">
                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row md:items-center p-6 gap-6">
                                    <div className="flex-shrink-0">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${payment.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' :
                                            payment.status === 'FAILED' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
                                            }`}>
                                            {payment.status === 'COMPLETED' ? <CheckCircle2 size={24} /> :
                                                payment.status === 'FAILED' ? <XCircle size={24} /> : <Clock size={24} />}
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="font-bold text-lg text-dark-50 truncate">Thanh toán phí khám</h3>
                                            {statusBadge(payment.status)}
                                        </div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-dark-400">
                                            <div className="flex items-center gap-1">
                                                <User size={14} />
                                                <span>{payment.doctorName}</span>
                                            </div>
                                            <div className="flex items-center gap-1 font-mono">
                                                <CreditCard size={14} />
                                                <span>TXN: {payment.transactionId || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                <span>{new Date(payment.paidAt || payment.appointmentDate).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2">
                                        <div className="text-xl font-black text-primary-400">
                                            {payment.amount.toLocaleString('vi-VN')} đ
                                        </div>
                                        <div className="flex gap-2">
                                            {payment.status === 'COMPLETED' ? (
                                                <Link to={`/payment/result?vnp_ResponseCode=00&vnp_TxnRef=${payment.paymentId}&vnp_TransactionStatus=00&vnp_Amount=${payment.amount * 100}&vnp_TransactionNo=${payment.transactionId}&vnp_PayDate=${payment.paidAt?.replace(/[-T:.]/g, '')}`}>
                                                    <Button variant="ghost" size="sm" className="h-9 text-dark-400 hover:text-primary-400 gap-2">
                                                        <FileText size={16} /> Chi tiết
                                                    </Button>
                                                </Link>
                                            ) : payment.status === 'PENDING' ? (
                                                <Link to={`/checkout/${payment.appointmentId}`}>
                                                    <Button variant="primary" size="sm" className="h-9 gap-2 shadow-lg shadow-primary-500/20">
                                                        Thanh toán ngay <ChevronRight size={16} />
                                                    </Button>
                                                </Link>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-20 bg-dark-800/20 rounded-3xl border border-dashed border-dark-700/50">
                        <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center text-dark-500 mx-auto mb-4">
                            <CreditCard size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-dark-200">Không tìm thấy giao dịch nào</h3>
                        <p className="text-dark-500 mt-1 max-w-sm mx-auto">Các khoản thanh toán của bạn sẽ xuất hiện tại đây sau khi thực hiện giao dịch.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentHistoryPage;
