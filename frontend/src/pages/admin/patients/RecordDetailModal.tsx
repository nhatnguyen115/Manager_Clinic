import { Modal } from '@components/ui/Modal';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import {
    Activity,
    Clipboard,
    FileText,
    Thermometer,
    Pill,
    Calendar,
    User
} from 'lucide-react';
import type { MedicalRecordResponse } from '@/types';

interface RecordDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    record: MedicalRecordResponse | null;
}

const RecordDetailModal = ({ isOpen, onClose, record }: RecordDetailModalProps) => {
    if (!record) return null;

    const vitalSigns = record.vitalSigns || {};

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Chi tiết bệnh án"
            size="lg"
        >
            <div className="space-y-6">
                {/* Info Header */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary-900/30 flex items-center justify-center text-primary-400">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Ngày khám</p>
                            <p className="text-slate-100 font-medium">{new Date(record.createdAt).toLocaleDateString('vi-VN')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-emerald-900/30 flex items-center justify-center text-emerald-400">
                            <User size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Bác sĩ phụ trách</p>
                            <p className="text-slate-100 font-medium">{record.doctorName}</p>
                        </div>
                    </div>
                </div>

                {/* Symptoms & Diagnosis */}
                <div className="space-y-4">
                    <div>
                        <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <Activity size={16} className="text-warning-500" /> Triệu chứng
                        </h4>
                        <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-800 text-slate-200">
                            {record.symptoms || 'Không có mô tả'}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <Clipboard size={16} className="text-primary-500" /> Chẩn đoán
                        </h4>
                        <div className="p-3 bg-primary-900/10 rounded-lg border border-primary-900/20 text-slate-50 font-medium italic">
                            {record.diagnosis}
                        </div>
                    </div>
                </div>

                {/* Vital Signs */}
                <div>
                    <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Thermometer size={16} className="text-error-500" /> Chỉ số sinh tồn
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-800 text-center">
                            <p className="text-[10px] text-slate-500 uppercase">Cân nặng</p>
                            <p className="text-slate-100 font-bold">{vitalSigns.weight || '--'} <span className="text-[10px] font-normal text-slate-400">kg</span></p>
                        </div>
                        <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-800 text-center">
                            <p className="text-[10px] text-slate-500 uppercase">Chiều cao</p>
                            <p className="text-slate-100 font-bold">{vitalSigns.height || '--'} <span className="text-[10px] font-normal text-slate-400">cm</span></p>
                        </div>
                        <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-800 text-center">
                            <p className="text-[10px] text-slate-500 uppercase">Nhiệt độ</p>
                            <p className="text-slate-100 font-bold">{vitalSigns.temp || '--'} <span className="text-[10px] font-normal text-slate-400">°C</span></p>
                        </div>
                        <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-800 text-center">
                            <p className="text-[10px] text-slate-500 uppercase">Huyết áp</p>
                            <p className="text-slate-100 font-bold">{vitalSigns.bp || '--'}</p>
                        </div>
                    </div>
                </div>

                {/* Treatment & Prescriptions */}
                <div className="space-y-4">
                    <div>
                        <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <FileText size={16} className="text-emerald-500" /> Điều trị
                        </h4>
                        <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-800 text-slate-200 whitespace-pre-wrap">
                            {record.treatment || 'Không có mô tả'}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <Pill size={16} className="text-purple-500" /> Đơn thuốc
                        </h4>
                        {record.prescription?.details && record.prescription.details.length > 0 ? (
                            <div className="space-y-2">
                                {record.prescription.details.map((p, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-800/40 rounded border border-slate-700">
                                        <div>
                                            <span className="text-slate-100 font-medium">{p.medicineName}</span>
                                            <span className="mx-2 text-slate-500">•</span>
                                            <span className="text-slate-400 text-sm">{p.dosage} - {p.frequency}</span>
                                        </div>
                                        <Badge size="sm">{p.duration}</Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-800 text-slate-500 italic text-sm text-center">
                                Không có đơn thuốc được kê
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-800">
                    <Button variant="outline" onClick={onClose}>Đóng</Button>
                </div>
            </div>
        </Modal>
    );
};

export default RecordDetailModal;
