import { useState, useEffect } from 'react';
import {
    Stethoscope,
    Search,
    Filter,
    Edit,
    UserCheck,
    UserX,
    Eye,
    Download,
    Star,
    Users,
    ShieldAlert
} from 'lucide-react';
import { Card, CardContent } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { Badge } from '@components/ui/Badge';
import { Table } from '@components/ui/Table';
import { ConfirmationModal } from '@components/ui/ConfirmationModal';
import { Link } from 'react-router-dom';
import adminService from '@services/adminService';
import { useToast } from '@hooks/useToast';
import type { DoctorResponse, SpecialtyResponse } from '@/types';
import DoctorDetailModal from './DoctorDetailModal';
import DoctorEditModal from './DoctorEditModal';

const DoctorsListPage = () => {
    const { showToast } = useToast();
    const [doctors, setDoctors] = useState<DoctorResponse[]>([]);
    const [specialties, setSpecialties] = useState<SpecialtyResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [specialtyFilter, setSpecialtyFilter] = useState<string>('');
    const [selectedDoctor, setSelectedDoctor] = useState<DoctorResponse | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [lockTarget, setLockTarget] = useState<DoctorResponse | null>(null);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [doctorsData, specialtiesData] = await Promise.all([
                adminService.getAllDoctors(specialtyFilter || undefined),
                adminService.getAllSpecialtiesAdmin()
            ]);
            setDoctors(doctorsData || []);
            setSpecialties(specialtiesData || []);
        } catch (error) {
            console.error('Failed to load doctors data:', error);
            showToast.error('Không thể tải danh sách bác sĩ');
            setDoctors([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleActive = async () => {
        if (!lockTarget) return;

        try {
            const action = lockTarget.isActive ? 'khóa' : 'mở khóa';
            await adminService.toggleUserActive(lockTarget.userId);
            showToast.success(`Đã ${action} tài khoản bác sĩ thành công`);
            setLockTarget(null);
            loadData();
        } catch (error) {
            console.error('Failed to toggle active status:', error);
            showToast.error('Cập nhật trạng thái thất bại');
        }
    };

    useEffect(() => {
        loadData();
    }, [specialtyFilter]);

    const filteredDoctors = doctors.filter(d =>
        (d.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.specialtyName || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const columns = [
        {
            header: 'Bác sĩ',
            accessor: (d: DoctorResponse) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary-900/30 flex items-center justify-center font-bold text-primary-400">
                        {d.fullName?.charAt(0) || 'D'}
                    </div>
                    <div>
                        <p className="font-semibold text-slate-50">{d.fullName}</p>
                        <p className="text-xs text-slate-400">ID: {d.id.substring(0, 8)}...</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Chuyên khoa',
            accessor: (d: DoctorResponse) => (
                <Badge variant="primary" size="sm">{d.specialtyName}</Badge>
            )
        },
        {
            header: 'Trình độ',
            accessor: (d: DoctorResponse) => (
                <span className="text-sm text-slate-200">{d.experienceYears ? `${d.experienceYears} năm kinh nghiệm` : 'Bác sĩ'}</span>
            )
        },
        {
            header: 'Xếp hạng',
            accessor: (d: DoctorResponse) => (
                <div className="flex items-center gap-1">
                    <Star size={14} className="text-amber-400 fill-amber-400" />
                    <span className="text-sm font-bold text-slate-100">{d.avgRating?.toFixed(1) || '0.0'}</span>
                    <span className="text-xs text-slate-500">({d.totalReviews || 0})</span>
                </div>
            )
        },
        {
            header: 'Trạng thái',
            accessor: (d: DoctorResponse) => (
                <Badge variant={d.isActive ? 'success' : 'error'} size="sm">
                    {d.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                </Badge>
            )
        },
        {
            header: 'Thao tác',
            className: 'text-right',
            accessor: (d: DoctorResponse) => (
                <div className="flex items-center justify-end gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        title="Xem chi tiết"
                        onClick={() => {
                            setSelectedDoctor(d);
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
                            setSelectedDoctor(d);
                            setIsEditModalOpen(true);
                        }}
                    >
                        <Edit size={16} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        title={d.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                        className={d.isActive ? "text-error hover:bg-error/10" : "text-emerald-500 hover:bg-emerald-500/10"}
                        onClick={() => setLockTarget(d)}
                    >
                        {d.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
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
                        <Stethoscope className="text-primary-500" size={24} />
                        Quản lý bác sĩ
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Xem và quản lý đội ngũ bác sĩ, chuyên khoa và lịch trình
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Download size={16} className="mr-2" /> Xuất danh sách
                    </Button>
                    <Link to="/admin/users">
                        <Button variant="primary" size="sm">
                            <Users size={16} className="mr-2" /> Thêm bác sĩ
                        </Button>
                    </Link>
                </div>
            </div>

            <Card>
                <CardContent className="p-4 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <Input
                            placeholder="Tìm bác sĩ theo tên hoặc chuyên khoa..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 min-w-[200px]">
                        <Filter className="text-slate-500" size={18} />
                        <select
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm outline-none"
                            value={specialtyFilter}
                            onChange={(e) => setSpecialtyFilter(e.target.value)}
                        >
                            <option value="">Tất cả chuyên khoa</option>
                            {specialties.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                </CardContent>
            </Card>

            <Table
                columns={columns}
                data={filteredDoctors}
                keyExtractor={(d) => d.id}
                isLoading={isLoading}
                emptyMessage="Không tìm thấy bác sĩ nào"
            />

            <DoctorDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                onEdit={() => {
                    setIsDetailModalOpen(false);
                    setIsEditModalOpen(true);
                }}
                doctor={selectedDoctor}
            />

            {selectedDoctor && (
                <DoctorEditModal
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedDoctor(null);
                    }}
                    onSuccess={loadData}
                    doctor={selectedDoctor}
                    specialties={specialties}
                />
            )}

            <ConfirmationModal
                isOpen={!!lockTarget}
                onClose={() => setLockTarget(null)}
                onConfirm={handleToggleActive}
                title={lockTarget?.isActive ? "Khóa tài khoản bác sĩ" : "Mở khóa tài khoản bác sĩ"}
                message={
                    lockTarget?.isActive
                        ? `Bạn có chắc chắn muốn khóa tài khoản của Bác sĩ ${lockTarget.fullName}? Bác sĩ này sẽ không thể đăng nhập hoặc nhận lịch hẹn mới.`
                        : `Bạn có chắc chắn muốn mở khóa tài khoản cho Bác sĩ ${lockTarget?.fullName}?`
                }
                confirmText={lockTarget?.isActive ? "Khóa tài khoản" : "Mở khóa"}
                variant={lockTarget?.isActive ? "danger" : "success"}
                icon={lockTarget?.isActive ? UserX : UserCheck}
            />

            <div className="flex items-center gap-2 p-4 bg-error/5 border border-error/20 rounded-xl mt-4 max-w-2xl">
                <ShieldAlert className="text-error" size={20} />
                <div>
                    <p className="text-sm font-semibold text-slate-50">Lưu ý quản trị</p>
                    <p className="text-xs text-slate-400">
                        Việc khóa tài khoản sẽ ngăn chặn bác sĩ đăng nhập và nhận lịch hẹn. Hãy cẩn trọng khi thực hiện thao tác này.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DoctorsListPage;
