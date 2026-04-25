import { Modal } from '@components/ui/Modal';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import {
    Mail,
    Phone,
    Link as LinkIcon,
    Award,
    BookOpen,
    Star,
    Stethoscope,
    Briefcase
} from 'lucide-react';
import type { DoctorResponse } from '@/types';

interface DoctorDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEdit?: () => void;
    doctor: DoctorResponse | null;
}

const DoctorDetailModal = ({ isOpen, onClose, onEdit, doctor }: DoctorDetailModalProps) => {
    if (!doctor) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Chi tiết bác sĩ"
            size="lg"
        >
            <div className="space-y-6">
                {/* Header Info */}
                <div className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                    <div className="h-20 w-20 rounded-2xl bg-primary-900/30 flex items-center justify-center text-3xl font-bold text-primary-400">
                        {doctor.fullName.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-50">{doctor.fullName}</h3>
                            <Badge variant={doctor.isAvailable ? 'success' : 'error'}>
                                {doctor.isAvailable ? 'Đang hoạt động' : 'Tạm nghỉ'}
                            </Badge>
                        </div>
                        <p className="text-primary-400 font-medium flex items-center gap-2 mt-1">
                            <Stethoscope size={16} /> {doctor.specialtyName}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-slate-400">
                            <div className="flex items-center gap-1">
                                <Star size={14} className="text-amber-400 fill-amber-400" />
                                <span className="font-bold text-slate-100">{doctor.avgRating?.toFixed(1) || '0.0'}</span>
                                <span>({doctor.totalReviews} đánh giá)</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Briefcase size={14} />
                                <span>{doctor.experienceYears} năm kinh nghiệm</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact & Professional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Thông tin liên hệ</h4>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-slate-200">
                                <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center">
                                    <Mail size={16} className="text-primary-500" />
                                </div>
                                <div className="text-sm">
                                    <p className="text-slate-400 text-xs">Email</p>
                                    <p>{doctor.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-slate-200">
                                <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center">
                                    <Phone size={16} className="text-primary-500" />
                                </div>
                                <div className="text-sm">
                                    <p className="text-slate-400 text-xs">Số điện thoại</p>
                                    <p>{doctor.phoneNumber || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-slate-200">
                                <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center">
                                    <LinkIcon size={16} className="text-primary-500" />
                                </div>
                                <div className="text-sm">
                                    <p className="text-slate-400 text-xs">Số giấy phép</p>
                                    <p>{doctor.licenseNumber || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Học vấn & Chứng chỉ</h4>
                        <div className="space-y-4">
                            <div>
                                <p className="text-slate-400 text-xs flex items-center gap-1 mb-2">
                                    <BookOpen size={12} /> Bằng cấp
                                </p>
                                <ul className="list-disc list-inside text-sm text-slate-200 space-y-1">
                                    {doctor.education && doctor.education.length > 0 ? (
                                        doctor.education.map((edu, idx) => <li key={idx}>{edu}</li>)
                                    ) : (
                                        <li className="text-slate-500 italic">Chưa cập nhật</li>
                                    )}
                                </ul>
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs flex items-center gap-1 mb-2">
                                    <Award size={12} /> Chứng chỉ
                                </p>
                                <ul className="list-disc list-inside text-sm text-slate-200 space-y-1">
                                    {doctor.certifications && doctor.certifications.length > 0 ? (
                                        doctor.certifications.map((cert, idx) => <li key={idx}>{cert}</li>)
                                    ) : (
                                        <li className="text-slate-500 italic">Chưa cập nhật</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Giới thiệu</h4>
                    <div className="p-4 bg-slate-900/30 rounded-lg border border-slate-800 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                        {doctor.bio || 'Chưa có thông tin giới thiệu.'}
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-800 gap-2">
                    <Button variant="outline" onClick={onClose}>Đóng</Button>
                    <Button variant="primary" onClick={onEdit}>Chỉnh sửa hồ sơ</Button>
                </div>
            </div>
        </Modal>
    );
};

export default DoctorDetailModal;
