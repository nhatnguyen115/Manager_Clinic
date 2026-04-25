import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Heart, Eye, Brain, Baby, Bone, Activity, Search, LucideIcon, Ear, Smile, Pill } from 'lucide-react';
import { SpecialtyCard } from '@components/appointments/SpecialtyCard';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { getAllSpecialties } from '@services/patientService';
import type { SpecialtyResponse } from '@/types';

import { BookingStepper } from '@components/appointments/BookingStepper';
import { SpecialtySkeleton } from '@components/appointments/BookingSkeletons';

// Map icon name from DB → Lucide component
const iconMap: Record<string, LucideIcon> = {
    Stethoscope, Heart, Eye, Brain, Baby, Bone, Activity, Ear, Smile, Pill,
};

const SelectSpecialtyPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [specialties, setSpecialties] = useState<SpecialtyResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                setIsLoading(true);
                const data = await getAllSpecialties();
                setSpecialties(data);
            } catch (error) {
                console.error('Failed to load specialties:', error);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    const filteredSpecialties = useMemo(() =>
        specialties.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())),
        [specialties, searchTerm]
    );

    const handleSelect = (id: string) => {
        navigate(`/booking/doctor/${id}`);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-20">
            <BookingStepper currentStep={1} />

            <section className="text-center space-y-4 max-w-2xl mx-auto">
                <h1 className="text-4xl font-extrabold text-slate-50 tracking-tight sm:text-5xl">
                    Đặt lịch khám chuyên khoa
                </h1>
                <p className="text-slate-400 text-lg">
                    Hệ thống bác sĩ hàng đầu, trang thiết bị hiện đại. Hãy chọn chuyên khoa bạn cần tư vấn.
                </p>

                <div className="pt-4 max-w-md mx-auto relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors" size={20} />
                    <Input
                        placeholder="Tìm kiếm chuyên khoa (ví dụ: Nội khoa, Tim mạch...)"
                        className="pl-14 pr-6 py-6 bg-slate-900/50 border-slate-700/50 focus:bg-slate-800 transition-all rounded-full shadow-lg focus:shadow-primary-900/10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </section>

            {isLoading ? (
                <SpecialtySkeleton />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 sm:px-0 stagger-children">
                    {filteredSpecialties.map((specialty, index) => (
                        <div key={specialty.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                            <SpecialtyCard
                                name={specialty.name}
                                description={specialty.description || ''}
                                icon={iconMap[specialty.icon || ''] || Stethoscope}
                                onClick={() => handleSelect(specialty.id)}
                                className="h-full rounded-[24px] border-slate-700/30 hover:shadow-wellness"
                            />
                        </div>
                    ))}
                    {filteredSpecialties.length === 0 && (
                        <div className="col-span-full py-24 text-center bg-slate-900/30 rounded-[32px] border border-dashed border-slate-700/50 animate-fade-in">
                            <div className="h-20 w-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-600">
                                <Search size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-100">Không tìm thấy chuyên khoa nào</h3>
                            <p className="text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                                Vui lòng thử từ khóa khác hoặc liên hệ hotline <span className="text-primary-400 font-bold">1900 1234</span> để được hỗ trợ nhanh nhất.
                            </p>
                            <Button variant="outline" className="mt-8 rounded-xl px-10" onClick={() => setSearchTerm('')}>
                                Quay lại danh sách
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SelectSpecialtyPage;
