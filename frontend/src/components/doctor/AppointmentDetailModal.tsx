import { useState } from 'react';
import {
    X,
    User,
    Calendar,
    Clock,
    FileText,
    CheckCircle2,
    XCircle,
    Stethoscope,
    AlertTriangle,
    ClipboardPlus
} from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import type { AppointmentResponse, AppointmentStatus } from '@/types';
import MedicalRecordFormModal from '@components/doctor/MedicalRecordFormModal';
import { createMedicalRecord } from '@services/doctorService';
import { toast } from 'react-hot-toast';

const statusVariant: Record<AppointmentStatus, 'primary' | 'success' | 'warning' | 'error' | 'info'> = {
    PENDING: 'warning',
    CONFIRMED: 'primary',
    COMPLETED: 'success',
    CANCELLED: 'error',
    NO_SHOW: 'error',
};

const statusLabel: Record<AppointmentStatus, string> = {
    PENDING: 'Chờ xác nhận',
    CONFIRMED: 'Đã xác nhận',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
    NO_SHOW: 'Không đến',
};

interface AppointmentDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointment: AppointmentResponse;
    onAction: (appointment: AppointmentResponse, action: string) => void;
}


interface MedicalRecordData {
    diagnosis: string;
    symptoms: string;
    vitalSigns: any;
    treatment: string;
    notes: string;
    followUpDate: string;
    actualFee: number;
    prescriptionNotes: string;
    prescriptionDetails: {
        medicineId: number;
        medicineName: string;
        dosage: string;
        frequency: string;
        duration: string;
        instructions: string;
        quantity: number;
    }[];
}

export const AppointmentDetailModal = ({ isOpen, onClose, appointment, onAction }: AppointmentDetailModalProps) => {
    const [cancelReason, setCancelReason] = useState('');
    const [showCancelForm, setShowCancelForm] = useState(false);
    const [showRecordForm, setShowRecordForm] = useState(false);

    if (!isOpen) return null;

    const apt = appointment;
    const dateObj = new Date(apt.appointmentDate + 'T00:00:00');
    const dateStr = dateObj.toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

    const handleCancel = () => {
        onAction(apt, 'CANCEL');
        setShowCancelForm(false);
        setCancelReason('');
    };

    const handleSaveRecord = async (data: MedicalRecordData) => {
        try {
            await createMedicalRecord({
                appointmentId: apt.id,
                diagnosis: data.diagnosis,
                symptoms: data.symptoms,
                vitalSigns: data.vitalSigns || undefined,
                treatment: data.treatment || undefined,
                notes: data.notes || undefined,
                followUpDate: data.followUpDate || undefined,
                actualFee: data.actualFee,
                prescriptionDetails: data.prescriptionDetails.length > 0 ? data.prescriptionDetails.map(p => ({
                    medicineId: p.medicineId,
                    dosage: p.dosage,
                    frequency: p.frequency,
                    duration: p.duration || undefined,
                    instructions: p.instructions || undefined,
                    quantity: p.quantity,
                })) : undefined,
            });
            toast.success('Đã tạo bệnh án thành công!');
            setShowRecordForm(false);
        } catch (error) {
            console.error('Failed to create medical record:', error);
            toast.error('Không thể tạo bệnh án. Vui lòng thử lại.');
        }
    };


    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary-900/40 flex items-center justify-center">
                                <Stethoscope className="text-primary-400" size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-50">Chi tiết lịch hẹn</h2>
                                <p className="text-xs text-slate-400">#{String(apt.id).slice(0, 8)}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Status Badge */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-400">Trạng thái</span>
                            <Badge variant={statusVariant[apt.status]} size="md">
                                {statusLabel[apt.status]}
                            </Badge>
                        </div>

                        {/* Patient Info */}
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                                Thông tin bệnh nhân
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary-900/40 flex items-center justify-center">
                                        <User className="text-primary-400" size={18} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-50">{apt.patientName}</p>
                                        <p className="text-xs text-slate-400">Bệnh nhân</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Schedule Info */}
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                                Lịch khám
                            </h3>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar size={14} className="text-primary-400" />
                                    <span className="text-slate-200">{dateStr}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock size={14} className="text-primary-400" />
                                    <span className="text-slate-200">
                                        {apt.appointmentTime}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Symptoms */}
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Triệu chứng
                            </h3>
                            <div className="flex items-start gap-2">
                                <FileText size={14} className="text-slate-500 mt-0.5" />
                                <p className="text-sm text-slate-200">{apt.symptoms || 'Chưa có thông tin triệu chứng'}</p>
                            </div>
                        </div>

                        {/* Notes */}
                        {apt.notes && (
                            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                    Ghi chú
                                </h3>
                                <p className="text-sm text-slate-200">{apt.notes}</p>
                            </div>
                        )}

                        {/* Cancel Form */}
                        {showCancelForm && (
                            <div className="bg-red-900/10 rounded-xl p-4 border border-red-700/30 space-y-3">
                                <div className="flex items-center gap-2 text-red-400 text-sm font-semibold">
                                    <AlertTriangle size={16} />
                                    Hủy lịch hẹn
                                </div>
                                <textarea
                                    placeholder="Lý do hủy (bắt buộc)..."
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-red-500/30"
                                    rows={3}
                                />
                                <div className="flex gap-2 justify-end">
                                    <Button size="sm" variant="ghost" onClick={() => setShowCancelForm(false)}>
                                        Quay lại
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="bg-red-600 hover:bg-red-500 text-white"
                                        onClick={handleCancel}
                                        disabled={!cancelReason.trim()}
                                    >
                                        Xác nhận hủy
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    {!showCancelForm && (
                        <div className="flex flex-col gap-2 p-6 border-t border-slate-700">
                            {apt.status === 'PENDING' && (
                                <div className="flex items-center gap-2">
                                    <Button
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white"
                                        onClick={() => onAction(apt, 'CONFIRM')}
                                    >
                                        <CheckCircle2 size={16} className="mr-2" /> Xác nhận
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1 border-red-700/50 text-red-400 hover:bg-red-900/20"
                                        onClick={() => setShowCancelForm(true)}
                                    >
                                        <XCircle size={16} className="mr-2" /> Từ chối
                                    </Button>
                                </div>
                            )}
                            {apt.status === 'CONFIRMED' && (
                                <div className="flex items-center gap-2">
                                    <Button
                                        className="flex-1 bg-primary-600 hover:bg-primary-500 text-white"
                                        onClick={() => setShowRecordForm(true)}
                                    >
                                        <ClipboardPlus size={16} className="mr-2" /> Tiếp nhận & Tạo bệnh án
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="border-slate-600 text-slate-300"
                                        onClick={() => setShowCancelForm(true)}
                                    >
                                        <XCircle size={16} className="mr-2" /> Hủy
                                    </Button>
                                </div>
                            )}
                            {apt.status === 'COMPLETED' && (
                                <Button
                                    className="w-full bg-emerald-700 hover:bg-emerald-600 text-white"
                                    onClick={() => setShowRecordForm(true)}
                                >
                                    <ClipboardPlus size={16} className="mr-2" /> Tạo / Xem bệnh án
                                </Button>
                            )}
                            {(apt.status === 'CANCELLED' || apt.status === 'NO_SHOW') && (
                                <p className="text-sm text-slate-500 text-center w-full">
                                    Lịch hẹn đã bị hủy
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Medical Record Form Modal (nested) */}
            <MedicalRecordFormModal
                isOpen={showRecordForm}
                onClose={() => setShowRecordForm(false)}
                onSave={handleSaveRecord}
                editData={null}
                patientName={apt.patientName}
            />
        </>
    );
};
