import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, Loader2 } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { DoctorCard } from '@components/appointments/DoctorCard';
import { DoctorReviewsModal } from '@components/appointments/DoctorReviewsModal';
import { getDoctorsBySpecialty, getAllSpecialties } from '@services/patientService';
import type { DoctorResponse, SpecialtyResponse } from '@/types';

import { BookingStepper } from '@components/appointments/BookingStepper';
import { DoctorSkeleton } from '@components/appointments/BookingSkeletons';

const SelectDoctorPage = () => {
    const { specialtyId } = useParams<{ specialtyId: string }>();
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState<DoctorResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [specialtyName, setSpecialtyName] = useState('Chuyên khoa');
    const [selectedDoctorForReviews, setSelectedDoctorForReviews] = useState<{ id: string; name: string } | null>(null);

    useEffect(() => {
        if (!specialtyId) return;
        const load = async () => {
            try {
                setIsLoading(true);
                const [doctorsData, specialtiesData] = await Promise.all([
                    getDoctorsBySpecialty(specialtyId),
                    getAllSpecialties()
                ]);

                setDoctors(doctorsData);

                // Try to get name from doctors first, then from specialty list
                const nameFromDoctors = doctorsData[0]?.specialtyName;
                const nameFromList = (specialtiesData as SpecialtyResponse[]).find(s => s.id === specialtyId)?.name;
                setSpecialtyName(nameFromDoctors || nameFromList || 'Chuyên khoa');

            } catch (error) {
                console.error('Failed to load doctors:', error);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [specialtyId]);

    const handleSelect = (doctorId: string) => {
        navigate(`/booking/date-time/${specialtyId}/${doctorId}`);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-20 px-4 sm:px-0">
            <BookingStepper currentStep={2} />

            <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/50 p-8 rounded-3xl border border-slate-700/50 backdrop-blur-sm">
                <div className="space-y-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-auto text-slate-500 hover:text-primary-400 group flex items-center bg-transparent"
                        onClick={() => navigate('/booking/specialty')}
                    >
                        <ArrowLeft size={16} className="mr-2 transition-transform group-hover:-translate-x-1" />
                        Quay lại chọn chuyên khoa
                    </Button>
                    <h1 className="text-3xl font-extrabold text-slate-50 tracking-tight">
                        Đội ngũ bác sĩ <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600 font-black px-1">{specialtyName}</span>
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Tìm thấy <span className="text-slate-100 font-bold">{doctors.length}</span> chuyên gia hàng đầu sẵn sàng hỗ trợ bạn.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2 bg-slate-800 border-slate-700 rounded-2xl group">
                        <Filter size={16} className="text-slate-500 group-hover:text-primary-500" />
                        <span>Bộ lọc nâng cao</span>
                    </Button>
                </div>
            </section>

            {isLoading ? (
                <DoctorSkeleton />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {doctors.map((doctor) => (
                        <DoctorCard
                            key={doctor.id}
                            name={doctor.fullName}
                            specialty={doctor.specialtyName || ''}
                            rating={doctor.avgRating || 0}
                            reviewCount={doctor.totalReviews || 0}
                            location={doctor.bio || ''}
                            onViewReviews={() => setSelectedDoctorForReviews({ id: doctor.id, name: doctor.fullName })}
                            onClick={() => handleSelect(doctor.id)}
                        />
                    ))}
                    {doctors.length === 0 && (
                        <div className="col-span-full py-24 text-center bg-slate-900/40 rounded-[2.5rem] border border-dashed border-slate-700">
                            <div className="h-24 w-24 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-500">
                                <Filter size={40} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-100 mb-2">Chưa có bác sĩ trong chuyên khoa này</h3>
                            <p className="text-slate-400 text-lg max-w-md mx-auto mb-8">
                                Hiện tại chúng tôi đang cập nhật đội ngũ bác sĩ cho chuyên khoa {specialtyName}.
                            </p>
                            <Button className="rounded-2xl px-10 py-6" onClick={() => navigate('/booking/specialty')}>
                                Chọn chuyên khoa khác
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {selectedDoctorForReviews && (
                <DoctorReviewsModal
                    isOpen={!!selectedDoctorForReviews}
                    onClose={() => setSelectedDoctorForReviews(null)}
                    doctorId={selectedDoctorForReviews.id}
                    doctorName={selectedDoctorForReviews.name}
                />
            )}
        </div>
    );
};

export default SelectDoctorPage;
