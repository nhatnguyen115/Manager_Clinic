import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    FileText,
    ArrowLeft,
    User,
    Stethoscope,
    Calendar,
    CreditCard,
    CheckCircle2,
    Hash,
    Receipt
} from 'lucide-react';
import { Card, CardContent } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { Loading } from '@components/ui/Loading';
import { paymentService, InvoiceResponse } from '@services/paymentService';
import { toast } from 'react-hot-toast';

const InvoiceDetailPage = () => {
    const { invoiceId } = useParams<{ invoiceId: string }>();
    const [invoice, setInvoice] = useState<InvoiceResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (invoiceId) fetchInvoice(invoiceId);
    }, [invoiceId]);

    const fetchInvoice = async (id: string) => {
        try {
            const response = await paymentService.getInvoiceById(id);
            if (response.result) {
                setInvoice(response.result);
            }
        } catch (error) {
            console.error('Fetch invoice error:', error);
            toast.error('Không thể tải thông tin hóa đơn');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading fullPage text="Đang tải hóa đơn..." />;
    if (!invoice) {
        return (
            <div className="text-center py-20">
                <p className="text-slate-400">Không tìm thấy hóa đơn</p>
                <Link to="/payment/history">
                    <Button variant="outline" className="mt-4">Quay lại lịch sử</Button>
                </Link>
            </div>
        );
    }

    const parseItems = () => {
        try {
            return JSON.parse(invoice.items || '[]');
        } catch {
            return [];
        }
    };

    const items = parseItems();

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            {/* Back */}
            <Link to="/payment/history" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-100 transition-colors text-sm">
                <ArrowLeft size={16} />
                Quay lại lịch sử giao dịch
            </Link>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-50 tracking-tight">Hóa đơn</h1>
                    <p className="text-slate-400 mt-1 font-mono">{invoice.invoiceNumber}</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center">
                    <Receipt className="text-primary-400" size={28} />
                </div>
            </div>

            {/* Invoice Card */}
            <Card className="border-slate-700/30">
                <CardContent className="p-0">
                    {/* Top banner */}
                    <div className="bg-gradient-to-r from-primary-900/30 to-slate-800/30 p-6 border-b border-slate-700/30 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400">Mã hóa đơn</p>
                                <p className="font-mono font-bold text-slate-100 text-lg">{invoice.invoiceNumber}</p>
                            </div>
                            <Badge variant="success" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-sm px-3 py-1">
                                <CheckCircle2 size={14} className="mr-1.5" />
                                Đã thanh toán
                            </Badge>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {invoice.patientName && (
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/40 border border-slate-700/30">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                                        <User size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Bệnh nhân</p>
                                        <p className="font-semibold text-slate-100">{invoice.patientName}</p>
                                    </div>
                                </div>
                            )}
                            {invoice.doctorName && (
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/40 border border-slate-700/30">
                                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400">
                                        <Stethoscope size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Bác sĩ</p>
                                        <p className="font-semibold text-slate-100">{invoice.doctorName}</p>
                                    </div>
                                </div>
                            )}
                            {invoice.specialtyName && (
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/40 border border-slate-700/30">
                                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                                        <Hash size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Chuyên khoa</p>
                                        <p className="font-semibold text-slate-100">{invoice.specialtyName}</p>
                                    </div>
                                </div>
                            )}
                            {invoice.appointmentDate && (
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/40 border border-slate-700/30">
                                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                                        <Calendar size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Ngày khám</p>
                                        <p className="font-semibold text-slate-100">
                                            {new Date(invoice.appointmentDate).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {invoice.paymentMethod && (
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/40 border border-slate-700/30">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                        <CreditCard size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Phương thức</p>
                                        <p className="font-semibold text-slate-100">{invoice.paymentMethod}</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/40 border border-slate-700/30">
                                <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-400">
                                    <FileText size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Ngày xuất hóa đơn</p>
                                    <p className="font-semibold text-slate-100">
                                        {new Date(invoice.issuedAt).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Line Items */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Chi tiết dịch vụ</h3>
                            <div className="rounded-xl overflow-hidden border border-slate-700/30">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-800/50">
                                        <tr>
                                            <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Dịch vụ</th>
                                            <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase text-center">SL</th>
                                            <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase text-right">Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/30">
                                        {items.length > 0 ? (
                                            items.map((item: any, idx: number) => (
                                                <tr key={idx} className="bg-slate-800/20">
                                                    <td className="px-4 py-3 text-slate-200 text-sm">{item.description}</td>
                                                    <td className="px-4 py-3 text-slate-300 text-sm text-center">{item.quantity}</td>
                                                    <td className="px-4 py-3 text-slate-100 font-semibold text-right">
                                                        {Number(item.total).toLocaleString('vi-VN')} đ
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={3} className="px-4 py-3 text-slate-400 text-sm">Phí khám bệnh</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="border-t border-slate-700/30 pt-4 space-y-2">
                            <div className="flex justify-between text-sm text-slate-400">
                                <span>Tạm tính</span>
                                <span>{invoice.subtotal.toLocaleString('vi-VN')} đ</span>
                            </div>
                            {invoice.taxRate > 0 && (
                                <>
                                    <div className="flex justify-between text-sm text-slate-400">
                                        <span>VAT ({(invoice.taxRate * 100).toFixed(0)}%)</span>
                                        <span>{invoice.taxAmount.toLocaleString('vi-VN')} đ</span>
                                    </div>
                                </>
                            )}
                            <div className="flex justify-between text-xl font-black text-slate-50 pt-2 border-t border-slate-700/30">
                                <span>Tổng cộng</span>
                                <span className="text-primary-400">{invoice.total.toLocaleString('vi-VN')} đ</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex gap-3">
                <Link to="/payment/history" className="flex-1">
                    <Button variant="outline" className="w-full">
                        <ArrowLeft size={16} className="mr-2" /> Quay lại
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default InvoiceDetailPage;
