import { useState, useEffect } from 'react';
import { Modal } from '@components/ui/Modal';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { X, Plus, Stethoscope } from 'lucide-react';
import adminService from '@services/adminService';
import type { DoctorResponse, DoctorRequest, SpecialtyResponse } from '@/types';
import { toast } from 'react-hot-toast';

interface DoctorEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    doctor: DoctorResponse;
    specialties: SpecialtyResponse[];
}

const DoctorEditModal = ({ isOpen, onClose, onSuccess, doctor, specialties }: DoctorEditModalProps) => {
    const [formData, setFormData] = useState<DoctorRequest>({
        fullName: doctor.fullName,
        phoneNumber: doctor.phoneNumber || '',
        bio: doctor.bio || '',
        experienceYears: doctor.experienceYears || 0,
        licenseNumber: doctor.licenseNumber || '',
        consultationFee: doctor.consultationFee || 0,
        isAvailable: doctor.isAvailable,
        specialtyId: doctor.specialtyId || '',
        education: doctor.education || [],
        certifications: doctor.certifications || []
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newEdu, setNewEdu] = useState('');
    const [newCert, setNewCert] = useState('');

    useEffect(() => {
        setFormData({
            fullName: doctor.fullName,
            phoneNumber: doctor.phoneNumber || '',
            bio: doctor.bio || '',
            experienceYears: doctor.experienceYears || 0,
            licenseNumber: doctor.licenseNumber || '',
            consultationFee: doctor.consultationFee || 0,
            isAvailable: doctor.isAvailable,
            specialtyId: doctor.specialtyId || '',
            education: doctor.education || [],
            certifications: doctor.certifications || []
        });
    }, [doctor]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    const handleToggleAvailable = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, isAvailable: e.target.checked }));
    };

    const handleAddEducation = () => {
        if (!newEdu.trim()) return;
        setFormData(prev => ({
            ...prev,
            education: [...(prev.education || []), newEdu.trim()]
        }));
        setNewEdu('');
    };

    const handleRemoveEducation = (index: number) => {
        setFormData(prev => ({
            ...prev,
            education: prev.education?.filter((_, i) => i !== index)
        }));
    };

    const handleAddCertification = () => {
        if (!newCert.trim()) return;
        setFormData(prev => ({
            ...prev,
            certifications: [...(prev.certifications || []), newCert.trim()]
        }));
        setNewCert('');
    };

    const handleRemoveCertification = (index: number) => {
        setFormData(prev => ({
            ...prev,
            certifications: prev.certifications?.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await adminService.updateDoctor(doctor.id, formData);
            toast.success('Cập nhật thông tin bác sĩ thành công');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Failed to update doctor:', error);
            const message = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="xl"
            title="Chỉnh sửa thông tin bác sĩ"
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
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-primary-400 uppercase tracking-wider flex items-center gap-2">
                            <Stethoscope size={16} /> Thông tin cơ bản
                        </h3>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-200">Họ và tên</label>
                            <Input
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Nhập họ và tên"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-200">Số điện thoại</label>
                            <Input
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                placeholder="Nhập số điện thoại"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-200">Kinh nghiệm (năm)</label>
                                <Input
                                    type="number"
                                    name="experienceYears"
                                    value={formData.experienceYears}
                                    onChange={handleChange}
                                    min={0}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-200">Phí khám (VND)</label>
                                <Input
                                    type="number"
                                    name="consultationFee"
                                    value={formData.consultationFee}
                                    onChange={handleChange}
                                    min={0}
                                    step={1000}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-200">Chuyên khoa</label>
                            <select
                                name="specialtyId"
                                value={formData.specialtyId}
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
                                value={formData.licenseNumber}
                                onChange={handleChange}
                                placeholder="Nhập số giấy phép hành nghề"
                            />
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                            <input
                                type="checkbox"
                                id="isAvailable"
                                checked={formData.isAvailable}
                                onChange={handleToggleAvailable}
                                className="w-4 h-4 rounded border-slate-700 text-primary-500 focus:ring-primary-500 bg-slate-900"
                            />
                            <label htmlFor="isAvailable" className="text-sm font-medium text-slate-100 cursor-pointer">
                                Sẵn sàng tiếp nhận bệnh nhân
                            </label>
                        </div>
                    </div>

                    {/* Education & Certs */}
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-primary-400 uppercase tracking-wider">Học vấn</h3>
                            <div className="flex gap-2">
                                <Input
                                    value={newEdu}
                                    onChange={(e) => setNewEdu(e.target.value)}
                                    placeholder="Thêm bằng cấp, trường học..."
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddEducation())}
                                />
                                <Button type="button" variant="outline" size="icon" onClick={handleAddEducation}>
                                    <Plus size={18} />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.education?.map((edu, idx) => (
                                    <div key={idx} className="flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-sm text-slate-100">
                                        <span>{edu}</span>
                                        <button type="button" onClick={() => handleRemoveEducation(idx)} className="text-slate-400 hover:text-error transition-colors">
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-primary-400 uppercase tracking-wider">Chứng chỉ</h3>
                            <div className="flex gap-2">
                                <Input
                                    value={newCert}
                                    onChange={(e) => setNewCert(e.target.value)}
                                    placeholder="Thêm chứng chỉ chuyên môn..."
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCertification())}
                                />
                                <Button type="button" variant="outline" size="icon" onClick={handleAddCertification}>
                                    <Plus size={18} />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.certifications?.map((cert, idx) => (
                                    <div key={idx} className="flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-sm text-slate-100">
                                        <span>{cert}</span>
                                        <button type="button" onClick={() => handleRemoveCertification(idx)} className="text-slate-400 hover:text-error transition-colors">
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-200">Giới thiệu bản thân</label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows={4}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:ring-1 focus:ring-primary-500 outline-none resize-none"
                                placeholder="Nhập giới thiệu ngắn về bác sĩ..."
                            />
                        </div>
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default DoctorEditModal;
