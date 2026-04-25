import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { AlertCircle, Calendar, Clock, User, Stethoscope } from 'lucide-react';
import type { AppointmentResponse } from '@/types';

interface CancelAppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => Promise<void>;
    appointment: AppointmentResponse | null;
}

export const CancelAppointmentModal = ({
    isOpen,
    onClose,
    onConfirm,
    appointment
}: CancelAppointmentModalProps) => {
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!appointment) return null;

    const handleConfirm = async () => {
        if (!reason.trim()) {
            return;
        }
        setIsLoading(true);
        try {
            await onConfirm(reason);
            onClose();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Xác nhận hủy lịch hẹn"
            size="md"
            footer={
                <div className="flex gap-3 w-full sm:w-auto">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="flex-1 sm:flex-none"
                        disabled={isLoading}
                    >
                        Quay lại
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleConfirm}
                        className="flex-1 sm:flex-none"
                        isLoading={isLoading}
                        disabled={!reason.trim()}
                    >
                        Hủy lịch hẹn
                    </Button>
                </div>
            }
        >
            <div className="space-y-6">
                <div className="bg-error/5 border border-error/10 rounded-xl p-4 flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-error/10 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="text-error" size={24} />
                    </div>
                    <div>
                        <h4 className="text-error font-semibold">Cảnh báo hủy lịch</h4>
                        <p className="text-sm text-slate-400 mt-1">
                            Hành động này không thể hoàn tác. Một thông báo sẽ được gửi đến cả bác sĩ và bệnh nhân.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                            <User size={14} className="text-slate-500" />
                            <span className="font-medium">Bệnh nhân:</span>
                        </div>
                        <p className="font-semibold text-slate-50 pl-6">{appointment.patientName}</p>

                        <div className="flex items-center gap-2 text-sm text-slate-300">
                            <Calendar size={14} className="text-slate-500" />
                            <span className="font-medium">Ngày khám:</span>
                        </div>
                        <p className="font-semibold text-slate-50 pl-6">{appointment.appointmentDate}</p>
                    </div>

                    <div className="space-y-3 border-l border-slate-700 pl-4">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                            <Stethoscope size={14} className="text-slate-500" />
                            <span className="font-medium">Bác sĩ:</span>
                        </div>
                        <p className="font-semibold text-slate-50 pl-6">{appointment.doctorName}</p>

                        <div className="flex items-center gap-2 text-sm text-slate-300">
                            <Clock size={14} className="text-slate-500" />
                            <span className="font-medium">Giờ khám:</span>
                        </div>
                        <p className="font-semibold text-slate-50 pl-6">{appointment.appointmentTime}</p>
                    </div>
                </div>

                <Textarea
                    label="Lý do hủy lịch"
                    placeholder="Nhập lý do chi tiết để thông báo cho bác sĩ và bệnh nhân..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    error={!reason.trim() ? "Vui lòng nhập lý do hủy lịch" : undefined}
                    className="min-h-[120px]"
                />
            </div>
        </Modal>
    );
};
