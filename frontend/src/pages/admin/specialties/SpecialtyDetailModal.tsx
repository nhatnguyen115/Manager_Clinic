import { useState, useEffect } from 'react';
import { Modal } from '@components/ui/Modal';
import { Button } from '@components/ui/Button';
import { Loading } from '@components/ui/Loading';
import {
    Users,
    Stethoscope,
    Star,
    Info,
    UserPlus,
    Trash2
} from 'lucide-react';
import adminService from '@services/adminService';
import type { SpecialtyResponse, DoctorResponse } from '@/types';
import AssignDoctorModal from './AssignDoctorModal';
import { toast } from 'react-hot-toast';

interface SpecialtyDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    specialty: SpecialtyResponse | null;
    onUpdate?: () => void;
}

const SpecialtyDetailModal = ({ isOpen, onClose, specialty, onUpdate }: SpecialtyDetailModalProps) => {
    const [doctors, setDoctors] = useState<DoctorResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isRemoving, setIsRemoving] = useState<string | null>(null);

    const loadDoctors = async () => {
        if (specialty) {
            try {
                setIsLoading(true);
                const data = await adminService.getAllDoctors(specialty.id);
                setDoctors(data);
            } catch (error) {
                console.error('Failed to load doctors for specialty:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        if (isOpen && specialty) {
            loadDoctors();
        } else {
            setDoctors([]);
        }
    }, [isOpen, specialty]);

    const handleRemoveDoctor = async (doctorId: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa bác sĩ này khỏi chuyên khoa?')) return;

        try {
            setIsRemoving(doctorId);
            await adminService.updateDoctorSpecialty(doctorId, null);
            toast.success('Đã xóa bác sĩ khỏi chuyên khoa');
            loadDoctors();
            onUpdate?.();
        } catch (error: any) {
            console.error('Failed to remove doctor:', error);
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setIsRemoving(null);
        }
    };

    const handleAssignSuccess = () => {
        loadDoctors();
        onUpdate?.();
    };

    if (!specialty) return null;

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title="Chi tiết chuyên khoa"
                size="lg"
            >
                <div className="space-y-6">
                    {/* Header Info */}
                    <div className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                        <div className="h-16 w-16 rounded-2xl bg-primary-900/30 flex items-center justify-center text-primary-400">
                            <Stethoscope size={32} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-slate-50">{specialty.name}</h3>
                            <p className="text-slate-400 text-sm mt-1">
                                {specialty.description || 'Chưa có mô tả cho chuyên khoa này.'}
                            </p>
                        </div>
                    </div>

                    {/* doctors List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                                <Users size={16} /> Danh sách bác sĩ ({doctors.length})
                            </h4>
                            <Button
                                size="sm"
                                variant="primary"
                                className="h-8"
                                onClick={() => setIsAssignModalOpen(true)}
                            >
                                <UserPlus size={14} className="mr-1" />
                                Thêm bác sĩ
                            </Button>
                        </div>

                        {isLoading ? (
                            <div className="py-10 flex justify-center">
                                <Loading size="sm" text="Đang tải danh sách bác sĩ..." />
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {doctors.length > 0 ? (
                                    doctors.map((doctor) => (
                                        <div
                                            key={doctor.id}
                                            className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 hover:bg-slate-800/60 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-primary-900/20 flex items-center justify-center font-bold text-primary-400">
                                                    {doctor.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-50">{doctor.fullName}</p>
                                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                                        <div className="flex items-center gap-0.5">
                                                            <Star size={10} className="text-amber-400 fill-amber-400" />
                                                            <span>{doctor.avgRating?.toFixed(1) || '0.0'}</span>
                                                        </div>
                                                        <span>•</span>
                                                        <span>{doctor.experienceYears} năm KN</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${doctor.isAvailable
                                                    ? 'bg-success/10 text-success'
                                                    : 'bg-error/10 text-error'
                                                    }`}>
                                                    {doctor.isAvailable ? 'Sẵn sàng' : 'Vắng mặt'}
                                                </div>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-error hover:bg-error/10"
                                                    onClick={() => handleRemoveDoctor(doctor.id)}
                                                    disabled={isRemoving === doctor.id}
                                                >
                                                    {isRemoving === doctor.id ? <Loading size="sm" /> : <Trash2 size={14} />}
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-10 text-center text-slate-500 bg-slate-900/20 rounded-xl border border-dashed border-slate-800">
                                        <Info size={24} className="mx-auto mb-2 opacity-20" />
                                        <p className="text-sm">Chưa có bác sĩ nào thuộc chuyên khoa này</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-800">
                        <Button variant="outline" onClick={onClose}>Đóng</Button>
                    </div>
                </div>
            </Modal>

            <AssignDoctorModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                specialtyId={specialty.id}
                onSuccess={handleAssignSuccess}
            />
        </>
    );
};

export default SpecialtyDetailModal;
