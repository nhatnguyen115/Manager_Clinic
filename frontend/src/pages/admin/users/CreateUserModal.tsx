import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Modal } from '@components/ui/Modal';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import adminService from '@services/adminService';
import { useToast } from '@hooks/useToast';
import type { AdminUserRequest, SpecialtyResponse } from '@/types';

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const CreateUserModal = ({ isOpen, onClose, onSuccess }: CreateUserModalProps) => {
    const { showToast } = useToast();
    const [formData, setFormData] = useState<AdminUserRequest>({
        email: '',
        password: '',
        fullName: '',
        phone: '',
        role: 'PATIENT',
        isActive: true,
        gender: 'MALE'
    });
    const [specialties, setSpecialties] = useState<SpecialtyResponse[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && formData.role === 'DOCTOR') {
            const fetchSpecialties = async () => {
                try {
                    const data = await adminService.getAllSpecialtiesAdmin();
                    setSpecialties(data);
                } catch (error) {
                    console.error('Failed to fetch specialties:', error);
                }
            };
            fetchSpecialties();
        }
    }, [isOpen, formData.role]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.email || !formData.fullName || !formData.password) {
            showToast.error('Vui lòng điền đầy đủ các thông tin bắt buộc');
            return;
        }

        // Basic validation for role-specific fields
        if (formData.role === 'DOCTOR' && !formData.specialtyId) {
            showToast.error('Vui lòng chọn chuyên khoa cho bác sĩ');
            return;
        }

        try {
            setIsSubmitting(true);
            await adminService.createUser(formData);
            showToast.success('Thêm người dùng thành công');
            setFormData({
                email: '',
                password: '',
                fullName: '',
                phone: '',
                role: 'PATIENT',
                isActive: true,
                gender: 'MALE'
            });
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Failed to create user:', error);
            const message = error.response?.data?.message || 'Có lỗi xảy ra khi thêm người dùng';
            showToast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    const renderRoleSpecificFields = () => {
        if (formData.role === 'DOCTOR') {
            return (
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-primary-900/5 rounded-xl border border-primary-800/20 mb-2">
                    <h4 className="md:col-span-2 text-xs font-bold text-primary-400 uppercase tracking-wider">Thông tin bác sĩ</h4>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-200">Chuyên khoa *</label>
                        <select
                            name="specialtyId"
                            value={formData.specialtyId || ''}
                            onChange={handleChange}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:ring-1 focus:ring-primary-500 outline-none"
                            required
                        >
                            <option value="">Chọn chuyên khoa</option>
                            {specialties.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-200">Số giấy phép</label>
                        <Input
                            name="licenseNumber"
                            value={formData.licenseNumber || ''}
                            onChange={handleChange}
                            placeholder="VD: CC-123456"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-200">Số năm kinh nghiệm</label>
                        <Input
                            name="experienceYears"
                            type="number"
                            value={formData.experienceYears || ''}
                            onChange={handleChange}
                            placeholder="VD: 10"
                            min={0}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-200">Phí khám (VNĐ)</label>
                        <Input
                            name="consultationFee"
                            type="number"
                            value={formData.consultationFee || ''}
                            onChange={handleChange}
                            placeholder="VD: 200000"
                            min={0}
                        />
                    </div>
                </div>
            );
        }

        if (formData.role === 'PATIENT') {
            return (
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-primary-900/5 rounded-xl border border-primary-800/20 mb-2">
                    <h4 className="md:col-span-2 text-xs font-bold text-primary-400 uppercase tracking-wider">Thông tin bệnh nhân</h4>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-200">Ngày sinh</label>
                        <Input
                            name="dateOfBirth"
                            type="date"
                            value={formData.dateOfBirth || ''}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-200">Giới tính</label>
                        <select
                            name="gender"
                            value={formData.gender || 'MALE'}
                            onChange={handleChange}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:ring-1 focus:ring-primary-500 outline-none"
                        >
                            <option value="MALE">Nam</option>
                            <option value="FEMALE">Nữ</option>
                            <option value="OTHER">Khác</option>
                        </select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-slate-200">Địa chỉ</label>
                        <Input
                            name="address"
                            value={formData.address || ''}
                            onChange={handleChange}
                            placeholder="Nhập địa chỉ cư trú"
                        />
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="lg"
            title="Thêm người dùng mới"
            footer={
                <div className="flex justify-end gap-3 w-full">
                    <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
                        Hủy
                    </Button>
                    <Button type="submit" variant="primary" disabled={isSubmitting} onClick={handleSubmit}>
                        {isSubmitting ? 'Đang lưu...' : 'Lưu người dùng'}
                    </Button>
                </div>
            }
        >
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-200">Họ và tên *</label>
                        <Input
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Nhập họ và tên đầy đủ"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-200">Email *</label>
                        <Input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="example@clinic.com"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-200">Số điện thoại</label>
                        <Input
                            name="phone"
                            value={formData.phone || ''}
                            onChange={handleChange}
                            placeholder="0123 456 789"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-200">Vai trò *</label>
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

                    {renderRoleSpecificFields()}

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-slate-200">Mật khẩu *</label>
                        <Input
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Nhập ít nhất 6 ký tự"
                            required
                            minLength={6}
                        />
                    </div>
                </div>

                <div className="bg-primary-900/10 border border-primary-700/30 rounded-xl p-4 flex items-start gap-3 mt-2">
                    <AlertCircle className="text-primary-400 shrink-0" size={18} />
                    <p className="text-xs text-slate-300">
                        Thông tin chi tiết của bác sĩ hoặc bệnh nhân sẽ được lưu trữ đồng thời vào hồ sơ tương ứng.
                    </p>
                </div>
            </div>
        </Modal>
    );
};

export default CreateUserModal;
