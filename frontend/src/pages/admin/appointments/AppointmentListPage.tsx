import { useState, useEffect, useMemo } from 'react';
import {
    Calendar, Search, Download,
    Clock, Check, X,
    RefreshCw, CheckSquare, Square,
    AlertTriangle, Trash2
} from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { Table } from '@components/ui/Table';
import { Avatar } from '@components/ui/Avatar';
import { ConfirmationModal } from '@components/ui/ConfirmationModal';
import { CancelAppointmentModal } from '@components/appointments/CancelAppointmentModal';
import adminService from '@services/adminService';
import { useToast } from '@hooks/useToast';
import { cn } from '@utils';
import type { AppointmentResponse } from '@/types';
import { format } from 'date-fns';

const AppointmentListPage = () => {
    const { showToast } = useToast();
    const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFrom, setDateFrom] = useState<string>('');
    const [dateTo, setDateTo] = useState<string>('');
    const [cancelTarget, setCancelTarget] = useState<AppointmentResponse | null>(null);

    // Bulk action states
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [bulkAction, setBulkAction] = useState<string>('');
    const [showBulkConfirm, setShowBulkConfirm] = useState(false);
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);

    const loadAppointments = async () => {
        try {
            setIsLoading(true);
            const data = await adminService.getAllAppointments({
                status: statusFilter || undefined,
                dateFrom: dateFrom || undefined,
                dateTo: dateTo || undefined
            });
            const sorted = (data || []).sort((a, b) => {
                const dateDiff = (b.appointmentDate || '').localeCompare(a.appointmentDate || '');
                if (dateDiff !== 0) return dateDiff;
                return (b.appointmentTime || '').localeCompare(a.appointmentTime || '');
            });
            setAppointments(sorted);
            setSelectedIds(new Set()); // Clear selection on reload
        } catch (error) {
            console.error('Failed to load appointments:', error);
            showToast.error('Không thể tải danh sách lịch hẹn');
            setAppointments([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            loadAppointments();
        }, 300);
        return () => clearTimeout(timer);
    }, [statusFilter, dateFrom, dateTo]);

    const filteredAppointments = appointments.filter(a =>
        (a.patientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.doctorName || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calculate stats
    const stats = useMemo(() => {
        return {
            total: appointments.length,
            pending: appointments.filter(a => a.status === 'PENDING').length,
            confirmed: appointments.filter(a => a.status === 'CONFIRMED').length,
            completed: appointments.filter(a => a.status === 'COMPLETED').length,
            cancelled: appointments.filter(a => a.status === 'CANCELLED').length,
        };
    }, [appointments]);

    // Conflict detection: find appointments with same doctor, same date, overlapping times
    const conflicts = useMemo(() => {
        const conflictMap = new Map<string, AppointmentResponse[]>();
        const active = appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'PENDING');

        for (let i = 0; i < active.length; i++) {
            for (let j = i + 1; j < active.length; j++) {
                const a = active[i];
                const b = active[j];
                if (
                    a.doctorId === b.doctorId &&
                    a.appointmentDate === b.appointmentDate &&
                    a.appointmentTime === b.appointmentTime
                ) {
                    const key = `${a.doctorId}-${a.appointmentDate}-${a.appointmentTime}`;
                    if (!conflictMap.has(key)) {
                        conflictMap.set(key, [a]);
                    }
                    const arr = conflictMap.get(key)!;
                    if (!arr.find(x => x.id === b.id)) arr.push(b);
                    if (!arr.find(x => x.id === a.id)) arr.push(a);
                }
            }
        }

        const conflictIds = new Set<string>();
        conflictMap.forEach(items => items.forEach(item => conflictIds.add(item.id)));
        return conflictIds;
    }, [appointments]);

    const handleExport = async () => {
        try {
            showToast.loading('Đang chuẩn bị báo cáo...');
            await adminService.exportAppointments(dateFrom, dateTo);
            showToast.dismiss();
            showToast.success('Đã tải xuống báo cáo lịch hẹn');
        } catch (error) {
            console.error('Export failed:', error);
            showToast.dismiss();
            showToast.error('Xuất báo cáo thất bại');
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await adminService.updateAppointmentStatus(id, status);
            showToast.success(`Đã cập nhật trạng thái lịch hẹn`);
            loadAppointments();
        } catch (error) {
            showToast.error('Cập nhật trạng thái thất bại');
        }
    };

    const handleCancel = async (reason: string) => {
        if (!cancelTarget) return;

        try {
            await adminService.cancelAppointment(cancelTarget.id, reason.trim() || 'Admin cancelled');
            showToast.success('Đã hủy lịch hẹn');
            loadAppointments();
        } catch (error) {
            showToast.error('Hủy lịch hẹn thất bại');
            throw error;
        }
    };

    // Bulk selection handlers
    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredAppointments.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredAppointments.map(a => a.id)));
        }
    };

    const handleBulkAction = async () => {
        if (!bulkAction || selectedIds.size === 0) return;

        setIsBulkProcessing(true);
        showToast.loading(`Đang xử lý ${selectedIds.size} lịch hẹn...`);

        let successCount = 0;
        let failCount = 0;

        for (const id of selectedIds) {
            try {
                if (bulkAction === 'CANCEL') {
                    await adminService.cancelAppointment(id, 'Hủy hàng loạt bởi Admin');
                } else {
                    await adminService.updateAppointmentStatus(id, bulkAction);
                }
                successCount++;
            } catch {
                failCount++;
            }
        }

        showToast.dismiss();

        if (failCount > 0) {
            showToast.error(`Thành công: ${successCount}, Thất bại: ${failCount}`);
        } else {
            showToast.success(`Đã xử lý ${successCount} lịch hẹn thành công`);
        }

        setIsBulkProcessing(false);
        setShowBulkConfirm(false);
        setSelectedIds(new Set());
        setBulkAction('');
        loadAppointments();
    };

    const getStatusBadge = (status: string, id?: string) => {
        const variants: Record<string, { label: string; color: string; bg: string; dot: string }> = {
            'PENDING': { label: 'Chờ xác nhận', color: 'text-amber-400', bg: 'bg-amber-400/10', dot: 'bg-amber-400' },
            'CONFIRMED': { label: 'Đã xác nhận', color: 'text-emerald-400', bg: 'bg-emerald-400/10', dot: 'bg-emerald-400' },
            'COMPLETED': { label: 'Đã khám xong', color: 'text-slate-400', bg: 'bg-slate-400/10', dot: 'bg-slate-400' },
            'CANCELLED': { label: 'Đã hủy', color: 'text-rose-400', bg: 'bg-rose-400/10', dot: 'bg-rose-400' },
            'NO_SHOW': { label: 'Không đến', color: 'text-orange-400', bg: 'bg-orange-400/10', dot: 'bg-orange-400' }
        };

        const config = variants[status] || { label: status, color: 'text-blue-400', bg: 'bg-blue-400/10', dot: 'bg-blue-400' };
        const isConflict = id && conflicts.has(id);

        return (
            <div className="flex items-center gap-2">
                <span className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-current opacity-80",
                    config.color, config.bg
                )}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
                    {config.label}
                </span>
                {isConflict && (
                    <span title="Xung đột lịch - Cùng bác sĩ, cùng thời gian">
                        <AlertTriangle size={14} className="text-amber-400 animate-pulse" />
                    </span>
                )}
            </div>
        );
    };

    const formatApptDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return 'N/A';
        try {
            return format(new Date(dateStr), 'dd/MM/yyyy');
        } catch (e) {
            return dateStr;
        }
    };

    const getBulkActionLabel = () => {
        switch (bulkAction) {
            case 'CONFIRMED': return 'xác nhận';
            case 'COMPLETED': return 'hoàn thành';
            case 'CANCEL': return 'hủy';
            default: return '';
        }
    };

    const columns = [
        {
            header: (
                <button onClick={toggleSelectAll} className="flex items-center justify-center w-full">
                    {selectedIds.size > 0 && selectedIds.size === filteredAppointments.length
                        ? <CheckSquare size={16} className="text-primary-500" />
                        : <Square size={16} className="text-slate-500" />
                    }
                </button>
            ),
            className: 'w-10',
            accessor: (a: AppointmentResponse) => (
                <button onClick={() => toggleSelect(a.id)} className="flex items-center justify-center w-full">
                    {selectedIds.has(a.id)
                        ? <CheckSquare size={16} className="text-primary-500" />
                        : <Square size={16} className="text-slate-600 hover:text-slate-400 transition-colors" />
                    }
                </button>
            )
        },
        {
            header: 'Thời gian',
            accessor: (a: AppointmentResponse) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-slate-50 font-medium">
                        <Calendar size={14} className="text-primary-500" />
                        {formatApptDate(a.appointmentDate)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Clock size={14} />
                        {a.appointmentTime || '--:--'}
                    </div>
                </div>
            )
        },
        {
            header: 'Bệnh nhân',
            accessor: (a: AppointmentResponse) => (
                <div className="flex items-center gap-3">
                    <Avatar
                        src={undefined}
                        alt={a.patientName}
                        fallback={a.patientName?.split(' ').map(n => n[0]).join('')}
                        size="sm"
                        className="border-emerald-500/20"
                    />
                    <div className="flex flex-col">
                        <span className="font-medium text-slate-50">{a.patientName || 'N/A'}</span>
                        <span className="text-[10px] text-slate-400">ID: {a.id.slice(0, 8)}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Bác sĩ',
            accessor: (a: AppointmentResponse) => (
                <div className="flex items-center gap-3">
                    <Avatar
                        src={undefined}
                        alt={a.doctorName}
                        fallback={a.doctorName?.split(' ').map(n => n[0]).join('')}
                        size="sm"
                        className="border-primary-500/20"
                    />
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 font-medium text-slate-100">
                            {a.doctorName || 'N/A'}
                        </div>
                        <span className="text-[10px] text-primary-400 uppercase font-bold tracking-wider">
                            {a.specialtyName || 'Tổng quát'}
                        </span>
                    </div>
                </div>
            )
        },
        {
            header: 'Trạng thái',
            accessor: (a: AppointmentResponse) => getStatusBadge(a.status, a.id)
        },
        {
            header: 'Thao tác',
            className: 'text-right',
            accessor: (a: AppointmentResponse) => (
                <div className="flex items-center justify-end gap-1.5">
                    {a.status === 'PENDING' && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors"
                            title="Xác nhận"
                            onClick={() => handleUpdateStatus(a.id, 'CONFIRMED')}
                        >
                            <Check size={18} />
                        </Button>
                    )}
                    {(a.status === 'PENDING' || a.status === 'CONFIRMED') && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-error hover:bg-error/10 hover:text-error transition-colors"
                            title="Hủy hẹn"
                            onClick={() => setCancelTarget(a)}
                        >
                            <X size={16} />
                        </Button>
                    )}
                </div>
            )
        }
    ];

    const tabStyles = (active: boolean) => cn(
        "px-6 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all cursor-pointer whitespace-nowrap",
        active
            ? "border-primary-500 text-primary-400 bg-primary-500/5"
            : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
    );

    return (
        <div className="space-y-8 animate-fade-in p-2 max-w-[1600px] mx-auto">
            {/* Header section with Stats */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-50 flex items-center gap-3 tracking-tighter">
                            <Calendar className="text-primary-500" size={32} />
                            QUẢN LÝ LỊCH HẸN
                        </h1>
                        <p className="text-slate-500 text-sm font-medium mt-1 uppercase tracking-widest">
                            {filteredAppointments.length} lịch hẹn được tìm thấy trong hệ thống
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => loadAppointments()}
                            className="text-slate-400 hover:text-primary-400 bg-slate-800/50"
                        >
                            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleExport} className="border-slate-800 bg-slate-900/50 hover:bg-slate-800 px-6 font-bold uppercase tracking-tighter">
                            <Download size={16} className="mr-2 text-primary-500" /> Xuất Báo Cáo
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    {[
                        { label: 'Tất cả', count: stats.total, color: 'text-slate-400', bg: 'bg-slate-400/5' },
                        { label: 'Chờ xác nhận', count: stats.pending, color: 'text-amber-400', bg: 'bg-amber-400/5' },
                        { label: 'Đã xác nhận', count: stats.confirmed, color: 'text-emerald-400', bg: 'bg-emerald-400/5' },
                        { label: 'Hoàn thành', count: stats.completed, color: 'text-primary-400', bg: 'bg-primary-400/5' },
                        { label: 'Đã hủy/Vắng', count: stats.cancelled, color: 'text-rose-400', bg: 'bg-rose-400/5' },
                    ].map((s, idx) => (
                        <div key={idx} className={cn("p-4 rounded-2xl border border-slate-800 flex flex-col gap-1 transition-all hover:border-slate-700", s.bg)}>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{s.label}</span>
                            <span className={cn("text-2xl font-black tracking-tighter", s.color)}>{s.count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Conflict Alert */}
            {conflicts.size > 0 && (
                <div className="flex items-center gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl animate-fade-in">
                    <div className="p-2 bg-amber-500/20 rounded-lg">
                        <AlertTriangle className="text-amber-400" size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-50">Phát hiện xung đột lịch hẹn</p>
                        <p className="text-xs text-slate-400 mt-0.5 font-medium uppercase tracking-wider">
                            Có <strong className="text-amber-400">{conflicts.size}</strong> lịch hẹn trùng bác sĩ và thời gian
                        </p>
                    </div>
                </div>
            )}

            {/* Filter Bar */}
            <div className="space-y-0">
                {/* Tabs */}
                <div className="flex border-b border-slate-800 bg-slate-900/40 rounded-t-2xl overflow-x-auto no-scrollbar">
                    {[
                        { label: 'Toàn bộ', value: '' },
                        { label: 'Chờ xử lý', value: 'PENDING' },
                        { label: 'Đã xác nhận', value: 'CONFIRMED' },
                        { label: 'Đã hoàn tất', value: 'COMPLETED' },
                        { label: 'Đã hủy', value: 'CANCELLED' },
                        { label: 'Vắng mặt', value: 'NO_SHOW' }
                    ].map((tab) => (
                        <div
                            key={tab.value}
                            onClick={() => setStatusFilter(tab.value)}
                            className={tabStyles(statusFilter === tab.value)}
                        >
                            {tab.label}
                        </div>
                    ))}
                </div>

                <div className="p-6 bg-slate-900/20 border-x border-b border-slate-800 rounded-b-2xl space-y-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors" size={20} />
                            <Input
                                placeholder="Tìm theo tên bệnh nhân, bác sĩ hoặc mã ID..."
                                className="pl-12 h-14 bg-slate-900/50 border-slate-800 focus:bg-slate-900 transition-all text-base rounded-2xl"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-2xl border border-slate-800">
                            <div className="flex items-center gap-3 px-3">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Từ ngày</span>
                                <Input
                                    type="date"
                                    className="w-36 h-10 bg-transparent border-none text-slate-50 focus:ring-0 text-sm"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                />
                            </div>
                            <div className="w-px h-6 bg-slate-800" />
                            <div className="flex items-center gap-3 px-3">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Đến ngày</span>
                                <Input
                                    type="date"
                                    className="w-36 h-10 bg-transparent border-none text-slate-50 focus:ring-0 text-sm"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                />
                            </div>
                            {(dateFrom || dateTo) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-slate-500 hover:text-rose-400"
                                    onClick={() => { setDateFrom(''); setDateTo(''); }}
                                >
                                    <X size={16} />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Bulk Action Bar - Inline */}
                    {selectedIds.size > 0 && (
                        <div className="flex items-center gap-4 p-4 bg-primary-500/5 border border-primary-500/20 rounded-xl animate-scale-in">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary-500/20 rounded-lg">
                                    <CheckSquare size={18} className="text-primary-400" />
                                </div>
                                <span className="text-sm text-slate-100 font-bold">
                                    Đã chọn {selectedIds.size} lịch hẹn
                                </span>
                            </div>
                            <div className="flex-1" />
                            <div className="flex items-center gap-2">
                                <select
                                    value={bulkAction}
                                    onChange={(e) => setBulkAction(e.target.value)}
                                    className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 text-sm outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-medium"
                                >
                                    <option value="">Chọn thao tác nhanh...</option>
                                    <option value="CONFIRMED">Xác nhận lịch</option>
                                    <option value="COMPLETED">Đánh dấu hoàn thành</option>
                                    <option value="CANCEL">Hủy lịch đã chọn</option>
                                </select>
                                <Button
                                    size="sm"
                                    variant={bulkAction === 'CANCEL' ? 'outline' : 'primary'}
                                    className={cn(
                                        "px-6 font-bold uppercase tracking-widest shadow-lg",
                                        bulkAction === 'CANCEL' ? 'border-rose-500/50 text-rose-400 hover:bg-rose-500/10' : 'shadow-primary-500/20'
                                    )}
                                    disabled={!bulkAction || isBulkProcessing}
                                    onClick={() => setShowBulkConfirm(true)}
                                >
                                    ÁP DỤNG
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-slate-500 hover:text-slate-300 font-bold uppercase tracking-widest text-[10px]"
                                    onClick={() => { setSelectedIds(new Set()); setBulkAction(''); }}
                                >
                                    Hủy bỏ
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-slate-900/20 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
                <Table
                    columns={columns}
                    data={filteredAppointments}
                    keyExtractor={(a) => a.id}
                    isLoading={isLoading}
                    emptyMessage="Không tìm thấy lịch hẹn nào với bộ lọc hiện tại"
                />
            </div>

            <CancelAppointmentModal
                isOpen={!!cancelTarget}
                onClose={() => setCancelTarget(null)}
                onConfirm={handleCancel}
                appointment={cancelTarget}
            />

            <ConfirmationModal
                isOpen={showBulkConfirm}
                onClose={() => setShowBulkConfirm(false)}
                onConfirm={handleBulkAction}
                title={`${getBulkActionLabel().charAt(0).toUpperCase() + getBulkActionLabel().slice(1)} hàng loạt`}
                message={`Hành động này sẽ ${getBulkActionLabel()} ${selectedIds.size} lịch hẹn đã chọn. Xác nhận thực hiện?`}
                confirmText={`XÁC NHẬN ${getBulkActionLabel().toUpperCase()}`}
                variant={bulkAction === 'CANCEL' ? 'danger' : 'info'}
                icon={bulkAction === 'CANCEL' ? Trash2 : Check}
            />
        </div>
    );
};

export default AppointmentListPage;
