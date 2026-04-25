import { useState, useEffect } from 'react';
import { Modal } from '@components/ui/Modal';
import { Table, Column } from '@components/ui/Table';
import { Button } from '@components/ui/Button';
import { Loader2, Eye, Calendar, User } from 'lucide-react';
import adminService from '@services/adminService';
import type { MedicalRecordResponse, PatientResponse } from '@/types';

interface PatientHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    patient: PatientResponse | null;
    onViewDetail: (record: MedicalRecordResponse) => void;
}

const PatientHistoryModal = ({ isOpen, onClose, patient, onViewDetail }: PatientHistoryModalProps) => {
    const [records, setRecords] = useState<MedicalRecordResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && patient?.id) {
            const fetchRecords = async () => {
                try {
                    setIsLoading(true);
                    const data = await adminService.getPatientRecords(patient.id);
                    setRecords(data);
                } catch (error) {
                    console.error('Failed to fetch patient records:', error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchRecords();
        }
    }, [isOpen, patient?.id]);

    const columns: Column<MedicalRecordResponse>[] = [
        {
            header: 'Ngày khám',
            accessor: (item) => (
                <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-500" />
                    <span>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
            )
        },
        {
            header: 'Bác sĩ',
            accessor: (item) => (
                <div className="flex items-center gap-2">
                    <User size={14} className="text-slate-500" />
                    <span>{item.doctorName}</span>
                </div>
            )
        },
        {
            header: 'Chẩn đoán',
            accessor: 'diagnosis',
            className: 'max-w-[300px] truncate'
        },
        {
            header: 'Thao tác',
            accessor: (item) => (
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary-500 hover:text-primary-400 gap-2"
                    onClick={() => onViewDetail(item)}
                >
                    <Eye size={16} />
                    Chi tiết
                </Button>
            ),
            className: 'text-right'
        }
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Lịch sử khám: ${patient?.fullName}`}
            size="xl"
        >
            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 size={40} className="animate-spin text-primary-500" />
                        <p className="text-slate-400">Đang tải lịch sử bệnh án...</p>
                    </div>
                ) : records.length > 0 ? (
                    <div className="overflow-hidden rounded-xl border border-slate-800">
                        <Table
                            columns={columns}
                            data={records}
                            keyExtractor={(item) => item.id}
                        />
                    </div>
                ) : (
                    <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
                        <p className="text-slate-400">Bệnh nhân này chưa có lịch sử khám bệnh.</p>
                    </div>
                )}

                <div className="flex justify-end pt-4">
                    <Button variant="outline" onClick={onClose}>Đóng</Button>
                </div>
            </div>
        </Modal>
    );
};

export default PatientHistoryModal;
