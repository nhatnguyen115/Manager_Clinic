import { useState, useEffect } from 'react';
import {
    Stethoscope,
    Search,
    Plus,
    Edit,
    Trash2,
    ChevronRight,
    Users,
    ClipboardList
} from 'lucide-react';
import { Card, CardContent } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { Loading } from '@components/ui/Loading';
import adminService from '@services/adminService';
import SpecialtyModal from './SpecialtyModal';
import SpecialtyDetailModal from './SpecialtyDetailModal';
import type { SpecialtyResponse } from '@/types';
import { toast } from 'react-hot-toast';

const SpecialtiesListPage = () => {
    const [specialties, setSpecialties] = useState<SpecialtyResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSpecialty, setSelectedSpecialty] = useState<SpecialtyResponse | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const loadSpecialties = async () => {
        try {
            setIsLoading(true);
            const data = await adminService.getAllSpecialtiesAdmin();
            setSpecialties(data);
        } catch (error) {
            console.error('Failed to load specialties:', error);
            toast.error('Không thể tải danh sách chuyên khoa');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadSpecialties();
    }, []);

    const filteredSpecialties = specialties.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleEdit = (specialty: SpecialtyResponse) => {
        setSelectedSpecialty(specialty);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedSpecialty(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa chuyên khoa này?')) return;

        try {
            await adminService.deleteSpecialty(id);
            toast.success('Đã xóa chuyên khoa');
            loadSpecialties();
        } catch (error) {
            toast.error('Không thể xóa chuyên khoa');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in p-2">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-50 flex items-center gap-2">
                        <ClipboardList className="text-primary-500" size={24} />
                        Quản lý chuyên khoa
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Cấu hình các chuyên khoa khám bệnh và thông tin mô tả
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="primary" size="sm" onClick={handleAdd}>
                        <Plus size={16} className="mr-2" /> Thêm chuyên khoa
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-4">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <Input
                            placeholder="Tìm kiếm chuyên khoa..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {isLoading ? (
                <div className="py-20 flex justify-center">
                    <Loading text="Đang tải dữ liệu chuyên khoa..." />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSpecialties.length > 0 ? filteredSpecialties.map((s) => (
                        <Card key={s.id} className="hover:border-primary-500/30 transition-all group">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="h-12 w-12 rounded-2xl bg-primary-900/20 flex items-center justify-center text-primary-400 group-hover:scale-110 transition-transform">
                                        <Stethoscope size={24} />
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(s)}>
                                            <Edit size={16} className="text-slate-400" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}>
                                            <Trash2 size={16} className="text-error" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <h3 className="text-lg font-bold text-slate-50">{s.name}</h3>
                                    <p className="text-sm text-slate-400 mt-2 line-clamp-2 min-h-[40px]">
                                        {s.description || 'Chưa có mô tả cho chuyên khoa này.'}
                                    </p>
                                </div>
                                <div className="mt-6 pt-6 border-t border-slate-700/50 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-slate-300">
                                        <Users size={16} />
                                        <span className="text-xs font-medium">Bác sĩ: {s.doctorCount || 0}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-primary-400 p-0 hover:bg-transparent"
                                        onClick={() => {
                                            setSelectedSpecialty(s);
                                            setIsDetailModalOpen(true);
                                        }}
                                    >
                                        Chi tiết <ChevronRight size={14} className="ml-1" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )) : (
                        <div className="col-span-full py-20 text-center text-slate-500 bg-slate-900/20 rounded-2xl border border-dashed border-slate-700">
                            Không tìm thấy chuyên khoa nào
                        </div>
                    )}
                </div>
            )}

            <SpecialtyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={loadSpecialties}
                specialty={selectedSpecialty}
            />

            <SpecialtyDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                specialty={selectedSpecialty}
                onUpdate={loadSpecialties}
            />
        </div>
    );
};

export default SpecialtiesListPage;
