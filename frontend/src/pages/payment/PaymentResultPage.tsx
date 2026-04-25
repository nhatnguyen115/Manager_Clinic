import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
    CheckCircle2,
    XCircle,
    ArrowRight,
    FileText,
    ShieldCheck,
    AlertTriangle
} from 'lucide-react';
import { Card, CardContent } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Loading } from '@components/ui/Loading';
import { toast } from 'react-hot-toast';
import apiClient from '@services/apiClient';

const PaymentResultPage = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const [paymentInfo, setPaymentInfo] = useState<any>(null);

    useEffect(() => {
        const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
        const vnp_TxnRef = searchParams.get('vnp_TxnRef');
        const vnp_TransactionStatus = searchParams.get('vnp_TransactionStatus');
        const vnp_TransactionNo = searchParams.get('vnp_TransactionNo') || '';

        if (!vnp_ResponseCode || !vnp_TxnRef) {
            setStatus('error');
            setMessage('Thông tin thanh toán không hợp lệ');
            return;
        }

        // Notify backend: update payment status + create invoice (no HMAC needed)
        apiClient.post('/payments/confirm-return', null, {
            params: {
                txnRef: vnp_TxnRef,
                responseCode: vnp_ResponseCode,
                transactionStatus: vnp_TransactionStatus || '00',
                transactionNo: vnp_TransactionNo
            }
        }).catch(err => {
            console.warn('confirm-return error (non-critical):', err);
        });

        // VNPay returns vnp_ResponseCode=00 and vnp_TransactionStatus=00 for success
        if (vnp_ResponseCode === '00' && vnp_TransactionStatus === '00') {
            setStatus('success');
            setMessage('Thanh toán thành công!');
            setPaymentInfo({
                amount: parseInt(searchParams.get('vnp_Amount') || '0') / 100,
                transactionNo: vnp_TransactionNo,
                bankCode: searchParams.get('vnp_BankCode'),
                payDate: searchParams.get('vnp_PayDate'),
                orderId: vnp_TxnRef
            });
            toast.success('Thanh toán thành công!');
        } else {
            setStatus('failed');
            setMessage('Thanh toán không thành công hoặc đã bị hủy');
            toast.error('Thanh toán không thành công');
        }
    }, [searchParams]);


    if (status === 'loading') {
        return <Loading fullPage text="Đang xác thực giao dịch..." />;
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-12 animate-fade-in">
            <Card className={`overflow-hidden border-t-4 ${status === 'success' ? 'border-t-emerald-500' : 'border-t-red-500'}`}>
                <CardContent className="p-8 text-center">
                    {status === 'success' ? (
                        <div className="space-y-6">
                            <div className="flex justify-center">
                                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 animate-bounce-subtle">
                                    <CheckCircle2 size={48} />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-50">{message}</h1>
                                <p className="text-slate-400 mt-2">Cảm ơn bạn đã tin tưởng dịch vụ của ClinicPro.</p>
                            </div>

                            <div className="bg-slate-800/40 rounded-2xl p-6 text-left border border-slate-700/50 space-y-4">
                                <div className="flex justify-between items-center pb-3 border-b border-slate-700/30">
                                    <span className="text-slate-400 text-sm">Mã giao dịch VNPay</span>
                                    <span className="text-slate-100 font-mono text-sm">{paymentInfo?.transactionNo}</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-slate-700/30">
                                    <span className="text-slate-400 text-sm">Số tiền</span>
                                    <span className="text-primary-400 font-bold">{paymentInfo?.amount?.toLocaleString('vi-VN')} đ</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-slate-700/30">
                                    <span className="text-slate-400 text-sm">Ngân hàng</span>
                                    <span className="text-slate-100 font-medium">{paymentInfo?.bankCode}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 text-sm">Thời gian</span>
                                    <span className="text-slate-100 text-sm">
                                        {paymentInfo?.payDate ?
                                            `${paymentInfo.payDate.substring(6, 8)}/${paymentInfo.payDate.substring(4, 6)}/${paymentInfo.payDate.substring(0, 4)} ${paymentInfo.payDate.substring(8, 10)}:${paymentInfo.payDate.substring(10, 12)}`
                                            : ''}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Link to="/appointments" className="flex-1">
                                    <Button fullWidth variant="primary" className="h-12">
                                        Xem lịch hẹn <ArrowRight size={18} className="ml-2" />
                                    </Button>
                                </Link>
                                <Link to={`/appointments`} className="flex-1">
                                    <Button fullWidth variant="outline" className="h-12">
                                        <FileText size={18} className="mr-2" /> Quay lại chính
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex justify-center">
                                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
                                    {status === 'failed' ? <XCircle size={48} /> : <AlertTriangle size={48} />}
                                </div>
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-50">{status === 'failed' ? 'Thanh toán thất bại' : 'Lỗi hệ thống'}</h1>
                                <p className="text-slate-400 mt-2">{message}</p>
                            </div>

                            <div className="bg-slate-800/40 rounded-2xl p-6 text-slate-300 text-sm border border-slate-700/50">
                                <p>Nếu bạn đã bị trừ tiền nhưng không thấy xác nhận lịch hẹn, vui lòng liên hệ bộ phận hỗ trợ của ClinicPro để được xử lý sớm nhất.</p>
                                <p className="mt-4 font-bold text-primary-400">Hotline: 1900 123 456</p>
                            </div>

                            <div className="pt-4">
                                <Link to="/appointments">
                                    <Button variant="outline" className="h-12 px-8">
                                        Quay lại Lịch hẹn
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="mt-8 flex items-center justify-center gap-2 text-slate-500 text-xs">
                <ShieldCheck size={14} />
                <span>Giao dịch của bạn được bảo mật tuyệt đối bởi VNPay & ClinicPro</span>
            </div>
        </div>
    );
};

export default PaymentResultPage;
