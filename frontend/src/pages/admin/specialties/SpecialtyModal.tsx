import { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { Loading } from '@components/ui/Loading';
import adminService from '@services/adminService';
import type { SpecialtyResponse } from '@/types';
import { toast } from 'react-hot-toast';

interface SpecialtyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    specialty?: SpecialtyResponse | null;
}

const SpecialtyModal = ({ isOpen, onClose, onSuccess, specialty }: SpecialtyModalProps) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (specialty) {
            setName(specialty.name);
            setDescription(specialty.description || '');
        } else {
            setName('');
            setDescription('');
        }
    }, [specialty, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('Vui lòng nhập tên chuyên khoa');
            return;
        }

        try {
            setIsSubmitting(true);
            const data = { name, description };

            if (specialty) {
                await adminService.updateSpecialty(specialty.id, data);
                toast.success('Cập nhật chuyên khoa thành công');
            } else {
                await adminService.createSpecialty(data);
                toast.success('Thêm chuyên khoa mới thành công');
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Failed to save specialty:', error);
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu chuyên khoa');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in text-slate-50">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
                <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        {specialty ? 'Chỉnh sửa chuyên khoa' : 'Thêm chuyên khoa mới'}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={onClose} disabled={isSubmitting}>
                        <X size={20} />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Tên chuyên khoa</label>
                        <Input
                            placeholder="VD: Nội tổng quát, Răng Hàm Mặt..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Mô tả</label>
                        <textarea
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-100 min-h-[120px] focus:ring-2 focus:ring-primary-500/50 outline-none transition-all placeholder:text-slate-500"
                            placeholder="Mô tả chi tiết về chuyên khoa này..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            className="flex-1"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <Loading size="sm" className="mr-2" />
                            ) : (
                                <Save size={18} className="mr-2" />
                            )}
                            Lưu thay đổi
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SpecialtyModal;
