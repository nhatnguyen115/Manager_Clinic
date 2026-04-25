import { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Filter,
    Edit,
    UserCheck,
    UserX,
    Eye,
    Download,
    Mail,
    Phone,
    ShieldAlert
} from 'lucide-react';
import { Card, CardContent } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { Badge } from '@components/ui/Badge';
import { Table } from '@components/ui/Table';
import { ConfirmationModal } from '@components/ui/ConfirmationModal';
import adminService from '@services/adminService';
import { useToast } from '@hooks/useToast';
import type { PatientResponse, MedicalRecordResponse } from '@/types';
import PatientDetailModal from './PatientDetailModal';
import PatientEditModal from './PatientEditModal';
import PatientHistoryModal from './PatientHistoryModal';
import RecordDetailModal from './RecordDetailModal';

const PatientsListPage = () => {
    const { showToast } = useToast();
    const [patients, setPatients] = useState<PatientResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [genderFilter, setGenderFilter] = useState<string>('');
    const [selectedPatient, setSelectedPatient] = useState<PatientResponse | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isRecordDetailModalOpen, setIsRecordDetailModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<MedicalRecordResponse | null>(null);
    const [lockTarget, setLockTarget] = useState<PatientResponse | null>(null);

    const loadPatients = async () => {
        try {
            setIsLoading(true);
            const data = await adminService.getAllPatients();
            setPatients(data || []);
        } catch (error) {
            console.error('Failed to load patients:', error);
            showToast.error('Không thể tải danh sách bệnh nhân');
            setPatients([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleActive = async () => {
        if (!lockTarget) return;

        try {
            const action = lockTarget.isActive ? 'khóa' : 'mở khóa';
            await adminService.toggleUserActive(lockTarget.userId);
            showToast.success(`Đã ${action} tài khoản bệnh nhân thành công`);
            setLockTarget(null);
            loadPatients();
        } catch (error) {
            console.error('Failed to toggle active status:', error);
            showToast.error('Cập nhật trạng thái thất bại');
        }
    };

    useEffect(() => {
        loadPatients();
    }, []);

    const filteredPatients = patients.filter(p => {
        const matchesSearch = (p.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.phoneNumber || '').includes(searchQuery);
        const matchesGender = !genderFilter || p.gender === genderFilter;
        return matchesSearch && matchesGender;
    });

    const getAge = (dob?: string) => {
        if (!dob) return 'N/A';
        const age = new Date().getFullYear() - new Date(dob).getFullYear();
        return `${age} tuổi`;
    };

    const columns = [
        {
            header: 'Bệnh nhân',
            accessor: (p: PatientResponse) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-900/30 flex items-center justify-center font-bold text-emerald-400">
                        {p.fullName?.charAt(0) || 'P'}
                    </div>
                    <div>
                        <p className="font-semibold text-slate-50">{p.fullName}</p>
                        <p className="text-xs text-slate-400">ID: {p.id.substring(0, 8)}...</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Thông tin liên lạc',
            accessor: (p: PatientResponse) => (
                <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2 text-slate-200">
                        <Mail size={12} /> {p.email}
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                        <Phone size={12} /> {p.phoneNumber || 'N/A'}
                    </div>
                </div>
            )
        },
        {
            header: 'Giới tính / Tuổi',
            accessor: (p: PatientResponse) => (
                <div className="flex flex-col gap-1">
                    <Badge variant={p.gender === 'MALE' ? 'primary' : 'error'} size="sm">
                        {p.gender === 'MALE' ? 'Nam' : 'Nữ'}
                    </Badge>
                    <span className="text-xs text-slate-400">{getAge(p.dateOfBirth)}</span>
                </div>
            )
        },
        {
            header: 'Trạng thái',
            accessor: (p: PatientResponse) => (
                <Badge variant={p.isActive ? 'success' : 'error'} size="sm">
                    {p.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                </Badge>
            )
        },
        {
            header: 'Thao tác',
            className: 'text-right',
            accessor: (p: PatientResponse) => (
                <div className="flex items-center justify-end gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        title="Hồ sơ bệnh nhân"
                        onClick={() => {
                            setSelectedPatient(p);
                            setIsDetailModalOpen(true);
                        }}
                    >
                        <Eye size={16} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        title="Chỉnh sửa"
                        className="text-primary-400 hover:text-primary-300"
                        onClick={() => {
                            setSelectedPatient(p);
                            setIsEditModalOpen(true);
                        }}
                    >
                        <Edit size={16} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        title={p.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                        className={p.isActive ? "text-error hover:bg-error/10" : "text-emerald-500 hover:bg-emerald-500/10"}
                        onClick={() => setLockTarget(p)}
                    >
                        {p.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 animate-fade-in p-2">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-50 flex items-center gap-2">
                        <Users className="text-primary-500" size={24} />
                        Quản lý bệnh nhân
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Xem hồ sơ bệnh nhân, lịch sử khám và thông tin liên lạc
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Download size={16} className="mr-2" /> Xuất CSV
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-4 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <Input
                            placeholder="Tìm bệnh nhân theo tên, email hoặc SĐT..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 min-w-[200px]">
                        <Filter className="text-slate-500" size={18} />
                        <select
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm outline-none"
                            value={genderFilter}
                            onChange={(e) => setGenderFilter(e.target.value)}
                        >
                            <option value="">Tất cả giới tính</option>
                            <option value="MALE">Nam</option>
                            <option value="FEMALE">Nữ</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            <Table
                columns={columns}
                data={filteredPatients}
                keyExtractor={(p) => p.id}
                isLoading={isLoading}
                emptyMessage="Không tìm thấy bệnh nhân nào"
            />

            <PatientDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                patient={selectedPatient}
                onViewHistory={() => {
                    setIsDetailModalOpen(false);
                    setIsHistoryModalOpen(true);
                }}
            />

            {selectedPatient && (
                <PatientEditModal
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedPatient(null);
                    }}
                    onSuccess={loadPatients}
                    patient={selectedPatient}
                />
            )}

            <PatientHistoryModal
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                patient={selectedPatient}
                onViewDetail={(record) => {
                    setSelectedRecord(record);
                    setIsRecordDetailModalOpen(true);
                }}
            />

            <RecordDetailModal
                isOpen={isRecordDetailModalOpen}
                onClose={() => setIsRecordDetailModalOpen(false)}
                record={selectedRecord}
            />

            <ConfirmationModal
                isOpen={!!lockTarget}
                onClose={() => setLockTarget(null)}
                onConfirm={handleToggleActive}
                title={lockTarget?.isActive ? "Khóa tài khoản bệnh nhân" : "Mở khóa tài khoản"}
                message={
                    lockTarget?.isActive
                        ? `Bạn có chắc chắn muốn khóa tài khoản của bệnh nhân ${lockTarget.fullName}? Bệnh nhân này sẽ không thể đăng nhập hoặc đặt lịch hẹn.`
                        : `Bạn có chắc chắn muốn mở khóa tài khoản cho bệnh nhân ${lockTarget?.fullName}?`
                }
                confirmText={lockTarget?.isActive ? "Khóa tài khoản" : "Mở khóa"}
                variant={lockTarget?.isActive ? "danger" : "success"}
                icon={lockTarget?.isActive ? UserX : UserCheck}
            />

            <div className="flex items-center gap-2 p-4 bg-error/5 border border-error/20 rounded-xl mt-4 max-w-2xl">
                <ShieldAlert className="text-error" size={20} />
                <div>
                    <p className="text-sm font-semibold text-slate-50">Lưu ý bảo mật</p>
                    <p className="text-xs text-slate-400">
                        Tài khoản bị khóa sẽ bị thu hồi toàn bộ quyền truy cập vào hệ thống cho đến khi được quản trị viên mở lại.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PatientsListPage;
