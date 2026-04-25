import { Modal } from '@components/ui/Modal';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import {
    Mail,
    Phone,
    MapPin,
    Activity,
    AlertCircle,
    User,
    Calendar,
    Heart
} from 'lucide-react';
import type { PatientResponse } from '@/types';

interface PatientDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    patient: PatientResponse | null;
    onViewHistory: () => void;
}

const PatientDetailModal = ({ isOpen, onClose, patient, onViewHistory }: PatientDetailModalProps) => {
    if (!patient) return null;

    const getAge = (dob?: string) => {
        if (!dob) return 'N/A';
        const age = new Date().getFullYear() - new Date(dob).getFullYear();
        return `${age} tuổi`;
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Hồ sơ bệnh nhân"
            size="lg"
        >
            <div className="space-y-6">
                {/* Header Info */}
                <div className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                    <div className="h-16 w-16 rounded-full bg-emerald-900/30 flex items-center justify-center text-2xl font-bold text-emerald-400">
                        {patient.fullName.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-50">{patient.fullName}</h3>
                            <Badge variant="primary" size="sm">ID: {patient.id.substring(0, 8)}</Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-300">
                            <div className="flex items-center gap-1 capitalize">
                                <User size={14} className="text-slate-500" />
                                {patient.gender === 'MALE' ? 'Nam' : 'Nữ'}
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar size={14} className="text-slate-500" />
                                {getAge(patient.dateOfBirth)} ({patient.dateOfBirth || 'N/A'})
                            </div>
                            {patient.bloodType && (
                                <div className="flex items-center gap-1">
                                    <Heart size={14} className="text-error-500" />
                                    <span>Nhóm máu: </span>
                                    <span className="font-bold text-error-400">{patient.bloodType}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Contact & Personal Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Thông tin liên lạc</h4>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-slate-200">
                                <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center">
                                    <Mail size={16} className="text-emerald-500" />
                                </div>
                                <div className="text-sm">
                                    <p className="text-slate-400 text-xs">Email</p>
                                    <p>{patient.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-slate-200">
                                <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center">
                                    <Phone size={16} className="text-emerald-500" />
                                </div>
                                <div className="text-sm">
                                    <p className="text-slate-400 text-xs">Số điện thoại</p>
                                    <p>{patient.phoneNumber || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-slate-200">
                                <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center">
                                    <MapPin size={16} className="text-emerald-500" />
                                </div>
                                <div className="text-sm">
                                    <p className="text-slate-400 text-xs">Địa chỉ</p>
                                    <p className="max-w-[200px] leading-tight">{patient.address || 'N/A'}, {patient.city || ''}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Thông tin y tế</h4>
                        <div className="space-y-4">
                            <div>
                                <p className="text-slate-400 text-xs flex items-center gap-1 mb-2">
                                    <AlertCircle size={12} className="text-error-500" /> Dị ứng
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {patient.allergies && patient.allergies.length > 0 ? (
                                        patient.allergies.map((a, idx) => (
                                            <Badge key={idx} variant="error" size="sm">{a}</Badge>
                                        ))
                                    ) : (
                                        <span className="text-slate-500 italic text-sm">Không có dữ liệu</span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs flex items-center gap-1 mb-2">
                                    <Activity size={12} className="text-warning-500" /> Bệnh mãn tính
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {patient.chronicDiseases && patient.chronicDiseases.length > 0 ? (
                                        patient.chronicDiseases.map((d, idx) => (
                                            <Badge key={idx} variant="warning" size="sm">{d}</Badge>
                                        ))
                                    ) : (
                                        <span className="text-slate-500 italic text-sm">Không có dữ liệu</span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs mb-1">Liên hệ khẩn cấp</p>
                                <p className="text-sm text-slate-200 font-medium">
                                    {patient.emergencyContactName || 'N/A'}
                                    {patient.emergencyContactPhone && ` (${patient.emergencyContactPhone})`}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-800 gap-2">
                    <Button variant="outline" onClick={onClose}>Đóng</Button>
                    <Button variant="primary" onClick={onViewHistory}>Xem lịch sử khám</Button>
                </div>
            </div>
        </Modal>
    );
};

export default PatientDetailModal;
