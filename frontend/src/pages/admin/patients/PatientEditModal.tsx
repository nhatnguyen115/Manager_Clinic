import { useState, useEffect } from 'react';
import { Modal } from '@components/ui/Modal';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { X, Plus, User, Heart, Phone } from 'lucide-react';
import adminService from '@services/adminService';
import { useToast } from '@hooks/useToast';
import type { PatientResponse, PatientRequest } from '@/types';

interface PatientEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    patient: PatientResponse;
}

const PatientEditModal = ({ isOpen, onClose, onSuccess, patient }: PatientEditModalProps) => {
    const { showToast } = useToast();
    const [formData, setFormData] = useState<PatientRequest>({
        fullName: '',
        dateOfBirth: '',
        gender: '',
        phoneNumber: '',
        address: '',
        city: '',
        bloodType: '',
        allergies: [],
        chronicDiseases: [],
        emergencyContactName: '',
        emergencyContactPhone: '',
        insuranceNumber: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newAllergy, setNewAllergy] = useState('');
    const [newDisease, setNewDisease] = useState('');

    useEffect(() => {
        if (patient) {
            setFormData({
                fullName: patient.fullName || '',
                dateOfBirth: patient.dateOfBirth || '',
                gender: patient.gender || '',
                phoneNumber: patient.phoneNumber || '',
                address: patient.address || '',
                city: patient.city || '',
                bloodType: patient.bloodType || '',
                allergies: patient.allergies || [],
                chronicDiseases: patient.chronicDiseases || [],
                emergencyContactName: patient.emergencyContactName || '',
                emergencyContactPhone: patient.emergencyContactPhone || '',
                insuranceNumber: patient.insuranceNumber || '',
            });
        }
    }, [patient]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddAllergy = () => {
        if (!newAllergy.trim()) return;
        setFormData(prev => ({
            ...prev,
            allergies: [...(prev.allergies || []), newAllergy.trim()]
        }));
        setNewAllergy('');
    };

    const handleRemoveAllergy = (index: number) => {
        setFormData(prev => ({
            ...prev,
            allergies: prev.allergies?.filter((_, i) => i !== index)
        }));
    };

    const handleAddDisease = () => {
        if (!newDisease.trim()) return;
        setFormData(prev => ({
            ...prev,
            chronicDiseases: [...(prev.chronicDiseases || []), newDisease.trim()]
        }));
        setNewDisease('');
    };

    const handleRemoveDisease = (index: number) => {
        setFormData(prev => ({
            ...prev,
            chronicDiseases: prev.chronicDiseases?.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.fullName.trim()) {
            showToast.error('Vui lòng nhập họ và tên');
            return;
        }

        try {
            setIsSubmitting(true);
            await adminService.updatePatient(patient.id, formData);
            showToast.success('Cập nhật thông tin bệnh nhân thành công');
            onSuccess();
            onClose();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật';
            showToast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="xl"
            title="Chỉnh sửa hồ sơ bệnh nhân"
            footer={
                <div className="flex justify-end gap-3 w-full">
                    <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
                        Hủy
                    </Button>
                    <Button type="submit" variant="primary" disabled={isSubmitting} onClick={handleSubmit}>
                        {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-primary-400 uppercase tracking-wider flex items-center gap-2">
                            <User size={16} /> Thông tin cá nhân
                        </h3>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-200">Họ và tên *</label>
                            <Input
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Nhập họ và tên"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-200">Ngày sinh</label>
                                <Input
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-200">Giới tính</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:ring-1 focus:ring-primary-500 outline-none"
                                >
                                    <option value="">Chọn giới tính</option>
                                    <option value="MALE">Nam</option>
                                    <option value="FEMALE">Nữ</option>
                                    <option value="OTHER">Khác</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-200">Số điện thoại</label>
                            <Input
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                placeholder="0123 456 789"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-200">Địa chỉ</label>
                            <Input
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Nhập địa chỉ"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-200">Thành phố</label>
                                <Input
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="TP. Hồ Chí Minh"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-200">Số BHYT</label>
                                <Input
                                    name="insuranceNumber"
                                    value={formData.insuranceNumber}
                                    onChange={handleChange}
                                    placeholder="Nhập số BHYT"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Medical Info */}
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-primary-400 uppercase tracking-wider flex items-center gap-2">
                                <Heart size={16} /> Thông tin y tế
                            </h3>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-200">Nhóm máu</label>
                                <select
                                    name="bloodType"
                                    value={formData.bloodType}
                                    onChange={handleChange}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:ring-1 focus:ring-primary-500 outline-none"
                                >
                                    <option value="">Chọn nhóm máu</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                </select>
                            </div>

                            {/* Allergies */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-200">Dị ứng</label>
                                <div className="flex gap-2">
                                    <Input
                                        value={newAllergy}
                                        onChange={(e) => setNewAllergy(e.target.value)}
                                        placeholder="Thêm dị ứng..."
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAllergy())}
                                    />
                                    <Button type="button" variant="outline" size="icon" onClick={handleAddAllergy}>
                                        <Plus size={18} />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.allergies?.map((a, idx) => (
                                        <div key={idx} className="flex items-center gap-1 bg-error/10 px-3 py-1.5 rounded-lg border border-error/20 text-sm text-error">
                                            <span>{a}</span>
                                            <button type="button" onClick={() => handleRemoveAllergy(idx)} className="text-error/60 hover:text-error transition-colors">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Chronic Diseases */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-200">Bệnh mãn tính</label>
                                <div className="flex gap-2">
                                    <Input
                                        value={newDisease}
                                        onChange={(e) => setNewDisease(e.target.value)}
                                        placeholder="Thêm bệnh mãn tính..."
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDisease())}
                                    />
                                    <Button type="button" variant="outline" size="icon" onClick={handleAddDisease}>
                                        <Plus size={18} />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.chronicDiseases?.map((d, idx) => (
                                        <div key={idx} className="flex items-center gap-1 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 text-sm text-amber-400">
                                            <span>{d}</span>
                                            <button type="button" onClick={() => handleRemoveDisease(idx)} className="text-amber-400/60 hover:text-amber-400 transition-colors">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Emergency Contact */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-primary-400 uppercase tracking-wider flex items-center gap-2">
                                <Phone size={16} /> Liên hệ khẩn cấp
                            </h3>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-200">Tên người liên hệ</label>
                                <Input
                                    name="emergencyContactName"
                                    value={formData.emergencyContactName}
                                    onChange={handleChange}
                                    placeholder="Nhập tên người liên hệ"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-200">SĐT người liên hệ</label>
                                <Input
                                    name="emergencyContactPhone"
                                    value={formData.emergencyContactPhone}
                                    onChange={handleChange}
                                    placeholder="0123 456 789"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default PatientEditModal;
