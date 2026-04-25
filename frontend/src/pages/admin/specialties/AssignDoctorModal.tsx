import { useState, useEffect } from 'react';
import { Modal } from '@components/ui/Modal';
import { Button } from '@components/ui/Button';
import { Loading } from '@components/ui/Loading';
import { Search, UserPlus, Info } from 'lucide-react';
import adminService from '@services/adminService';
import type { DoctorResponse } from '@/types';
import { toast } from 'react-hot-toast';

interface AssignDoctorModalProps {
    isOpen: boolean;
    onClose: () => void;
    specialtyId: string;
    onSuccess: () => void;
}

const AssignDoctorModal = ({ isOpen, onClose, specialtyId, onSuccess }: AssignDoctorModalProps) => {
    const [doctors, setDoctors] = useState<DoctorResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [isAssigning, setIsAssigning] = useState<string | null>(null);

    useEffect(() => {
        const loadAvailableDoctors = async () => {
            if (isOpen) {
                try {
                    setIsLoading(true);
                    const data = await adminService.getDoctorsNoSpecialty();
                    setDoctors(data);
                } catch (error) {
                    console.error('Failed to load available doctors:', error);
                    toast.error('Không thể tải danh sách bác sĩ');
                } finally {
                    setIsLoading(false);
                }
            }
        };

        loadAvailableDoctors();
    }, [isOpen]);

    const handleAssign = async (doctorId: string) => {
        try {
            setIsAssigning(doctorId);
            await adminService.updateDoctorSpecialty(doctorId, specialtyId);
            toast.success('Gán chuyên khoa thành công');
            onSuccess();
            // Remove from local list to avoid double clicking
            setDoctors(prev => prev.filter(d => d.id !== doctorId));
        } catch (error: any) {
            console.error('Failed to assign doctor:', error);
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setIsAssigning(null);
        }
    };

    const filteredDoctors = doctors.filter(doctor =>
        doctor.fullName.toLowerCase().includes(search.toLowerCase()) ||
        (doctor.email && doctor.email.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Thêm bác sĩ vào chuyên khoa"
            size="md"
        >
            <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm bác sĩ theo tên hoặc email..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* List */}
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {isLoading ? (
                        <div className="py-10 flex justify-center">
                            <Loading size="sm" text="Đang tải danh sách..." />
                        </div>
                    ) : filteredDoctors.length > 0 ? (
                        filteredDoctors.map((doctor) => (
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
                                        <p className="text-xs text-slate-400">{doctor.email || 'Email không khả dụng'}</p>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant="primary"
                                    className="h-8"
                                    onClick={() => handleAssign(doctor.id)}
                                    disabled={isAssigning === doctor.id}
                                >
                                    {isAssigning === doctor.id ? (
                                        <Loading size="sm" />
                                    ) : (
                                        <>
                                            <UserPlus size={14} className="mr-1" />
                                            Thêm
                                        </>
                                    )}
                                </Button>
                            </div>
                        ))
                    ) : (
                        <div className="py-10 text-center text-slate-500 bg-slate-900/20 rounded-xl border border-dashed border-slate-800">
                            <Info size={24} className="mx-auto mb-2 opacity-20" />
                            <p className="text-sm">Không tìm thấy bác sĩ nào khả dụng</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-800">
                    <Button variant="outline" onClick={onClose}>Đóng</Button>
                </div>
            </div>
        </Modal>
    );
};

export default AssignDoctorModal;
