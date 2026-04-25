import { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';
import { Modal } from '@components/ui/Modal';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import adminService from '@services/adminService';
import { useToast } from '@hooks/useToast';
import type { AdminUserRequest, UserProfileResponse as UserResponse } from '@/types';

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    user: UserResponse;
}

const EditUserModal = ({ isOpen, onClose, onSuccess, user }: EditUserModalProps) => {
    const { showToast } = useToast();
    const [formData, setFormData] = useState<AdminUserRequest>({
        email: user.email,
        fullName: user.fullName,
        phone: user.phone || '',
        role: user.role,
        isActive: user.isActive
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setFormData({
            email: user.email,
            fullName: user.fullName,
            phone: user.phone || '',
            role: user.role,
            isActive: user.isActive
        });
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);
            await adminService.updateUser(user.id, formData);
            showToast.success('Cập nhật người dùng thành công');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Failed to update user:', error);
            const message = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật';
            showToast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="lg"
            title="Chỉnh sửa người dùng"
            footer={
                <div className="flex justify-end gap-3 w-full">
                    <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
                        Hủy
                    </Button>
                    <Button type="submit" variant="primary" disabled={isSubmitting} onClick={handleSubmit}>
                        {isSubmitting ? 'Đang lưu...' : 'Cập nhật'}
                    </Button>
                </div>
            }
        >
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-200">Email (Không thể đổi)</label>
                        <Input
                            value={formData.email}
                            disabled
                            className="bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-200">Vai trò</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:ring-1 focus:ring-primary-500 outline-none"
                            required
                        >
                            <option value="PATIENT">Bệnh nhân</option>
                            <option value="DOCTOR">Bác sĩ</option>
                            <option value="RECEPTIONIST">Lễ tân</option>
                            <option value="ADMIN">Quản trị viên</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-200">Họ và tên</label>
                        <Input
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-200">Số điện thoại</label>
                        <Input
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800 border border-slate-700 rounded-xl">
                    <div>
                        <p className="text-sm font-medium text-slate-50">Trạng thái tài khoản</p>
                        <p className="text-xs text-slate-400">Khóa hoặc mở khóa quyền truy cập của người dùng</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            name="isActive"
                            className="sr-only peer"
                            checked={formData.isActive}
                            onChange={handleChange}
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        <span className="ml-3 text-sm font-medium text-slate-200">
                            {formData.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                        </span>
                    </label>
                </div>

                <div className="flex items-center gap-2 p-4 bg-error/5 border border-error/20 rounded-xl mt-4">
                    <ShieldAlert className="text-error" size={20} />
                    <div>
                        <p className="text-sm font-semibold text-slate-50">Lưu ý bảo mật</p>
                        <p className="text-xs text-slate-400">
                            Việc thay đổi vai trò người dùng có thể ảnh hưởng đến quyền truy cập và dữ liệu liên quan.
                        </p>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default EditUserModal;
