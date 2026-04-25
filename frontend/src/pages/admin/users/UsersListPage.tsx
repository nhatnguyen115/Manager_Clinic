import { useState, useEffect } from 'react';
import {
    Users,
    UserPlus,
    Search,
    Filter,
    Edit,
    UserCheck,
    UserX,
    Key,
    Download,
    Mail,
    Phone
} from 'lucide-react';
import { Card, CardContent } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { Badge } from '@components/ui/Badge';
import { Table } from '@components/ui/Table';
import { ConfirmationModal } from '@components/ui/ConfirmationModal';
import adminService from '@services/adminService';
import { useToast } from '@hooks/useToast';
import type { UserProfileResponse as UserResponse } from '@/types';
import CreateUserModal from './CreateUserModal';
import EditUserModal from './EditUserModal';

const UsersListPage = () => {
    const { showToast } = useToast();
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [lockTarget, setLockTarget] = useState<UserResponse | null>(null);

    const loadUsers = async () => {
        try {
            setIsLoading(true);
            const data = await adminService.getAllUsers(roleFilter || undefined, searchQuery || undefined);
            setUsers(data || []);
        } catch (error) {
            console.error('Failed to load users:', error);
            showToast.error('Không thể tải danh sách người dùng');
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            loadUsers();
        }, 300); // Debounce search
        return () => clearTimeout(timer);
    }, [searchQuery, roleFilter]);

    const handleToggleActive = async () => {
        if (!lockTarget) return;

        try {
            const action = lockTarget.isActive ? 'khóa' : 'mở khóa';
            await adminService.toggleUserActive(lockTarget.id);
            showToast.success(`Đã ${action} tài khoản thành công`);
            setLockTarget(null);
            loadUsers();
        } catch (error) {
            console.error('Failed to toggle active status:', error);
            showToast.error('Cập nhật trạng thái thất bại');
        }
    };

    const handleResetPassword = async (userId: string) => {
        // Keeping window.confirm simplified for now or could use another ConfirmationModal
        if (!window.confirm('Bạn có chắc chắn muốn đặt lại mật khẩu cho người dùng này?')) return;

        try {
            showToast.loading('Đang đặt lại mật khẩu...');
            await adminService.resetPassword(userId);
            showToast.dismiss();
            showToast.success('Đã đặt lại mật khẩu thành công. Mật khẩu mới đã được gửi đến email người dùng.');
        } catch (error) {
            console.error('Failed to reset password:', error);
            showToast.dismiss();
            showToast.error('Đặt lại mật khẩu thất bại');
        }
    };

    const handleExport = async () => {
        try {
            showToast.loading('Đang chuẩn bị file CSV...');
            await adminService.exportUsers();
            showToast.dismiss();
            showToast.success('Đã tải xuống danh sách người dùng');
        } catch (error) {
            console.error('Export failed:', error);
            showToast.dismiss();
            showToast.error('Xuất dữ liệu thất bại');
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'ADMIN': return <Badge variant="error" size="sm">Admin</Badge>;
            case 'DOCTOR': return <Badge variant="primary" size="sm">Bác sĩ</Badge>;
            case 'PATIENT': return <Badge variant="success" size="sm">Bệnh nhân</Badge>;
            case 'RECEPTIONIST': return <Badge variant="warning" size="sm">Lễ tân</Badge>;
            default: return <Badge variant="info" size="sm">{role}</Badge>;
        }
    };

    const columns = [
        {
            header: 'Người dùng',
            accessor: (u: UserResponse) => (
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-slate-700 flex items-center justify-center font-bold text-primary-400 capitalize">
                        {(u.fullName || 'U').charAt(0)}
                    </div>
                    <span className="font-medium text-slate-50">{u.fullName || 'Unknown User'}</span>
                </div>
            )
        },
        {
            header: 'Email / SĐT',
            accessor: (u: UserResponse) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-200">
                        <Mail size={12} className="text-slate-400" /> {u.email}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Phone size={12} /> {u.phone || 'N/A'}
                    </div>
                </div>
            )
        },
        {
            header: 'Vai trò',
            accessor: (u: UserResponse) => getRoleBadge(u.role)
        },
        {
            header: 'Trạng thái',
            accessor: (u: UserResponse) => (
                <Badge variant={u.isActive ? 'success' : 'error'} size="sm">
                    {u.isActive ? 'Đang hoạt động' : 'Bị khóa'}
                </Badge>
            )
        },
        {
            header: 'Thao tác',
            className: 'text-right',
            accessor: (u: UserResponse) => (
                <div className="flex items-center justify-end gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        title="Chỉnh sửa"
                        onClick={() => {
                            setSelectedUser(u);
                            setIsEditModalOpen(true);
                        }}
                    >
                        <Edit size={16} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        title="Reset mật khẩu"
                        onClick={() => handleResetPassword(u.id)}
                    >
                        <Key size={16} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        title={u.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                        className={u.isActive ? "text-error hover:bg-error/10" : "text-emerald-500 hover:bg-emerald-500/10"}
                        onClick={() => setLockTarget(u)}
                    >
                        {u.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 animate-fade-in p-2">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-50 flex items-center gap-2">
                        <Users className="text-primary-500" size={24} />
                        Quản lý người dùng
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Quản lý tài khoản, phân quyền và trạng thái hoạt động của thành viên
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleExport}>
                        <Download size={16} className="mr-2" /> Xuất CSV
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => setIsCreateModalOpen(true)}>
                        <UserPlus size={16} className="mr-2" /> Thêm người dùng
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <Input
                            placeholder="Tìm kiếm theo tên hoặc email..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 min-w-[200px]">
                        <Filter className="text-slate-500" size={18} />
                        <select
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="">Tất cả vai trò</option>
                            <option value="PATIENT">Bệnh nhân</option>
                            <option value="DOCTOR">Bác sĩ</option>
                            <option value="ADMIN">Quản trị viên</option>
                            <option value="RECEPTIONIST">Lễ tân</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            <Table
                columns={columns}
                data={users}
                keyExtractor={(u) => u.id}
                isLoading={isLoading}
                emptyMessage="Không tìm thấy người dùng nào phù hợp"
            />

            {/* Modals */}
            <CreateUserModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={loadUsers}
            />

            {selectedUser && (
                <EditUserModal
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedUser(null);
                    }}
                    user={selectedUser}
                    onSuccess={loadUsers}
                />
            )}

            <ConfirmationModal
                isOpen={!!lockTarget}
                onClose={() => setLockTarget(null)}
                onConfirm={handleToggleActive}
                title={lockTarget?.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                message={
                    lockTarget?.isActive
                        ? `Bạn có chắc chắn muốn khóa tài khoản của ${lockTarget.fullName}? Người dùng này sẽ không thể đăng nhập vào hệ thống.`
                        : `Bạn có chắc chắn muốn mở khóa tài khoản cho ${lockTarget?.fullName}?`
                }
                confirmText={lockTarget?.isActive ? "Khóa tài khoản" : "Mở khóa"}
                variant={lockTarget?.isActive ? "danger" : "success"}
                icon={lockTarget?.isActive ? UserX : UserCheck}
            />
        </div>
    );
};

export default UsersListPage;
