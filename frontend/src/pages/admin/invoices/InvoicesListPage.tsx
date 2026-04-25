import { useEffect, useState } from 'react';
import {
    FileText,
    Search,
    Filter,
    Calendar,
    User,
    Stethoscope,
    CheckCircle2,
    Clock,
    Receipt,
    ChevronRight
} from 'lucide-react';
import { Card } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { Loading } from '@components/ui/Loading';
import { Modal } from '@components/ui/Modal';
import { paymentService, InvoiceResponse } from '@services/paymentService';
import { toast } from 'react-hot-toast';

// ─── Invoice Detail Modal ───────────────────────────────────────────────────
const InvoiceDetailModal = ({
    invoice,
    isOpen,
    onClose,
    onMarkPaid
}: {
    invoice: InvoiceResponse | null;
    isOpen: boolean;
    onClose: () => void;
    onMarkPaid: (id: string, method: string) => Promise<void>;
}) => {
    const [markingPaid, setMarkingPaid] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState('CASH');

    if (!invoice) return null;

    const parseItems = () => {
        try { return JSON.parse(invoice.items || '[]'); } catch { return []; }
    };

    const isPaid = invoice.paymentStatus === 'COMPLETED';

    const handleMarkPaid = async () => {
        setMarkingPaid(true);
        try {
            await onMarkPaid(invoice.id, selectedMethod);
            onClose();
        } finally {
            setMarkingPaid(false);
        }
    };

    const items = parseItems();

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Hóa đơn ${invoice.invoiceNumber}`} size="lg">
            <div className="space-y-5">
                {/* Status */}
                <div className="flex items-center gap-3">
                    {isPaid ? (
                        <Badge variant="success" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                            <CheckCircle2 size={13} className="mr-1" /> Đã thanh toán
                        </Badge>
                    ) : (
                        <Badge variant="warning" className="bg-amber-500/10 text-amber-400 border-amber-500/20">
                            <Clock size={13} className="mr-1" /> Chưa thanh toán
                        </Badge>
                    )}
                    <span className="text-xs text-slate-500 font-mono">{invoice.invoiceNumber}</span>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {invoice.patientName && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-800/40 border border-slate-700/30">
                            <User size={16} className="text-blue-400 flex-shrink-0" />
                            <div className="min-w-0">
                                <p className="text-xs text-slate-500">Bệnh nhân</p>
                                <p className="text-sm font-semibold text-slate-100 truncate">{invoice.patientName}</p>
                            </div>
                        </div>
                    )}
                    {invoice.doctorName && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-800/40 border border-slate-700/30">
                            <Stethoscope size={16} className="text-green-400 flex-shrink-0" />
                            <div className="min-w-0">
                                <p className="text-xs text-slate-500">Bác sĩ</p>
                                <p className="text-sm font-semibold text-slate-100 truncate">{invoice.doctorName}</p>
                            </div>
                        </div>
                    )}
                    {invoice.appointmentDate && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-800/40 border border-slate-700/30">
                            <Calendar size={16} className="text-amber-400 flex-shrink-0" />
                            <div className="min-w-0">
                                <p className="text-xs text-slate-500">Ngày khám</p>
                                <p className="text-sm font-semibold text-slate-100">
                                    {new Date(invoice.appointmentDate).toLocaleDateString('vi-VN')}
                                </p>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-800/40 border border-slate-700/30">
                        <FileText size={16} className="text-primary-400 flex-shrink-0" />
                        <div className="min-w-0">
                            <p className="text-xs text-slate-500">Ngày xuất</p>
                            <p className="text-sm font-semibold text-slate-100">
                                {new Date(invoice.issuedAt).toLocaleDateString('vi-VN')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Items */}
                <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Dịch vụ</h3>
                    <div className="rounded-xl overflow-hidden border border-slate-700/30">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-800/50">
                                <tr>
                                    <th className="px-3 py-2 text-xs text-slate-400">Mô tả</th>
                                    <th className="px-3 py-2 text-xs text-slate-400 text-right">Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length > 0 ? items.map((item: any, i: number) => (
                                    <tr key={i} className="border-t border-slate-700/30">
                                        <td className="px-3 py-2 text-slate-200">{item.description}</td>
                                        <td className="px-3 py-2 text-slate-100 font-semibold text-right">
                                            {Number(item.total).toLocaleString('vi-VN')} đ
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td className="px-3 py-2 text-slate-400">Phí khám bệnh</td>
                                        <td className="px-3 py-2 text-slate-100 font-semibold text-right">
                                            {invoice.total.toLocaleString('vi-VN')} đ
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center p-4 bg-primary-900/10 border border-primary-500/20 rounded-xl">
                    <span className="font-bold text-slate-200">Tổng cộng</span>
                    <span className="text-2xl font-black text-primary-400">{invoice.total.toLocaleString('vi-VN')} đ</span>
                </div>

                {/* Mark as Paid (only if not paid) */}
                {!isPaid && (
                    <div className="border-t border-slate-700/30 pt-4">
                        <p className="text-sm font-semibold text-slate-300 mb-3">Xác nhận thanh toán thủ công</p>
                        <div className="flex gap-3">
                            <select
                                value={selectedMethod}
                                onChange={(e) => setSelectedMethod(e.target.value)}
                                className="flex-1 bg-slate-800 border border-slate-700/50 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                            >
                                <option value="CASH">Tiền mặt</option>
                                <option value="BANK_TRANSFER">Chuyển khoản</option>
                                <option value="VNPAY">VNPay</option>
                            </select>
                            <Button
                                onClick={handleMarkPaid}
                                disabled={markingPaid}
                                className="whitespace-nowrap bg-emerald-600 hover:bg-emerald-700 border-0"
                            >
                                {markingPaid ? 'Đang xử lý...' : '✓ Đã thanh toán'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

// ─── Main List Page ──────────────────────────────────────────────────────────
const InvoicesListPage = () => {
    const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceResponse | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const response = await paymentService.getAllInvoices();
            if (response.result) {
                setInvoices(response.result);
            }
        } catch (error) {
            console.error('Fetch invoices error:', error);
            toast.error('Không thể tải danh sách hóa đơn');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkPaid = async (invoiceId: string, method: string) => {
        try {
            const response = await paymentService.markInvoiceAsPaid(invoiceId, method);
            if (response.result) {
                setInvoices(prev => prev.map(inv =>
                    inv.id === invoiceId ? response.result! : inv
                ));
                toast.success('Đã xác nhận thanh toán thành công!');
            }
        } catch (error) {
            console.error('Mark paid error:', error);
            toast.error('Không thể cập nhật trạng thái thanh toán');
        }
    };

    const handleViewDetail = (invoice: InvoiceResponse) => {
        setSelectedInvoice(invoice);
        setModalOpen(true);
    };

    const filteredInvoices = invoices.filter(inv =>
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.doctorName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <Loading fullPage text="Đang tải danh sách hóa đơn..." />;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-50 tracking-tight">Quản lý hóa đơn</h1>
                    <p className="text-slate-400 mt-1">Tổng cộng {invoices.length} hóa đơn đã phát hành</p>
                </div>
            </div>

            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm theo mã HĐ, bệnh nhân, bác sĩ..."
                        className="w-full bg-slate-800 border border-slate-700/50 rounded-xl py-2.5 pl-10 pr-4 text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all placeholder:text-slate-600"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="sm:w-32">
                    <Filter size={18} className="mr-2" /> Bộ lọc
                </Button>
            </div>

            {/* Table */}
            <Card className="border-slate-700/30 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-800/50 border-b border-slate-700/30">
                                <th className="px-6 py-4 text-sm font-bold text-slate-400 uppercase tracking-wider">Mã Hóa Đơn</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-400 uppercase tracking-wider">Bệnh nhân</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-400 uppercase tracking-wider">Bác sĩ</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-400 uppercase tracking-wider">Ngày xuất</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-400 uppercase tracking-wider">Tổng tiền</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-400 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-400 uppercase tracking-wider text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/30">
                            {filteredInvoices.length > 0 ? (
                                filteredInvoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-400">
                                                    <Receipt size={18} />
                                                </div>
                                                <span className="font-bold text-slate-100 font-mono text-sm">{invoice.invoiceNumber}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-300 text-sm">{invoice.patientName || '—'}</td>
                                        <td className="px-6 py-4 text-slate-300 text-sm">{invoice.doctorName || '—'}</td>
                                        <td className="px-6 py-4 text-slate-300 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-slate-500" />
                                                {new Date(invoice.issuedAt).toLocaleDateString('vi-VN')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-black text-emerald-400">{invoice.total.toLocaleString('vi-VN')} đ</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {invoice.paymentStatus === 'COMPLETED' ? (
                                                <Badge variant="success" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Đã TT</Badge>
                                            ) : (
                                                <Badge variant="warning" className="bg-amber-500/10 text-amber-500 border-amber-500/20">Chưa TT</Badge>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 text-slate-400 hover:text-primary-400"
                                                onClick={() => handleViewDetail(invoice)}
                                            >
                                                Chi tiết <ChevronRight size={14} className="ml-1" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 text-slate-500">
                                            <FileText size={40} />
                                            <p>Không tìm thấy hóa đơn nào</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Invoice Detail Modal */}
            <InvoiceDetailModal
                invoice={selectedInvoice}
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onMarkPaid={handleMarkPaid}
            />
        </div>
    );
};

export default InvoicesListPage;
