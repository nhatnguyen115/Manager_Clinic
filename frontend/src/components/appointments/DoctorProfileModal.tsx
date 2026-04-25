import { useState, useEffect } from 'react';
import { Modal } from '@components/ui/Modal';
import { Avatar } from '@components/ui/Avatar';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Award, GraduationCap, Briefcase, Calendar, MessageSquare, Loader2, Heart } from 'lucide-react';
import { getDoctorById } from '@services/patientService';
import { getDoctorReviews } from '@services/reviewService';
import type { DoctorResponse, ReviewResponse } from '@/types';
import { StarRating } from '@components/ui/StarRating';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@utils';

interface DoctorProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    doctorId: string;
}

export const DoctorProfileModal = ({ isOpen, onClose, doctorId }: DoctorProfileModalProps) => {
    const [doctor, setDoctor] = useState<DoctorResponse | null>(null);
    const [reviews, setReviews] = useState<ReviewResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'info' | 'reviews'>('info');

    useEffect(() => {
        if (isOpen && doctorId) {
            const loadData = async () => {
                try {
                    setIsLoading(true);
                    const [doctorData, reviewsData] = await Promise.all([
                        getDoctorById(doctorId),
                        getDoctorReviews(doctorId)
                    ]);
                    setDoctor(doctorData);
                    setReviews(reviewsData);
                } catch (error) {
                    console.error('Failed to load doctor profile:', error);
                } finally {
                    setIsLoading(false);
                }
            };
            loadData();
        }
    }, [isOpen, doctorId]);

    if (!doctorId) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={doctor ? `BS. ${doctor.fullName}` : 'Hồ sơ bác sĩ'}
            size="xl"
            className="p-0 overflow-hidden"
        >
            {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                    <Loader2 size={40} className="animate-spin text-primary-500" />
                    <p className="text-slate-400 font-medium">Đang tải hồ sơ bác sĩ...</p>
                </div>
            ) : doctor ? (
                <div className="flex flex-col h-[80vh]">
                    {/* Hero Header */}
                    <div className="p-8 bg-gradient-to-br from-primary-900/40 via-slate-900 to-slate-900 border-b border-slate-800">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="relative">
                                <Avatar
                                    src={doctor.avatarUrl}
                                    fallback={doctor.fullName.split(' ').map(n => n[0]).join('')}
                                    size="xxl"
                                    className="w-32 h-32 rounded-3xl border-4 border-slate-800 shadow-2xl"
                                />
                                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white rounded-full p-1.5 shadow-lg border-2 border-slate-900">
                                    <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                                </div>
                            </div>

                            <div className="flex-1 space-y-4">
                                <div>
                                    <Badge variant="primary" className="mb-2 bg-primary-500/10 text-primary-400 border-primary-500/20">
                                        {doctor.specialtyName || 'Chuyên khoa'}
                                    </Badge>
                                    <h2 className="text-3xl font-black text-slate-50 tracking-tight">BS. {doctor.fullName}</h2>
                                    <p className="text-slate-400 mt-1 flex items-center gap-2">
                                        <Briefcase size={16} className="text-primary-500" />
                                        {doctor.experienceYears || 0} năm kinh nghiệm
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-6 pt-2">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Đánh giá chung</span>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-xl font-black text-slate-50">{doctor.avgRating?.toFixed(1) || '0.0'}</span>
                                            <StarRating rating={doctor.avgRating || 0} size={14} />
                                        </div>
                                    </div>
                                    <div className="w-px h-8 bg-slate-800 hidden sm:block" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Lượt nhận xét</span>
                                        <span className="text-xl font-black text-slate-50 mt-0.5">{doctor.totalReviews || 0}</span>
                                    </div>
                                    <div className="w-px h-8 bg-slate-800 hidden sm:block" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Phí tham vấn</span>
                                        <span className="text-xl font-black text-primary-400 mt-0.5">
                                            {doctor.consultationFee?.toLocaleString('vi-VN')}đ
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="flex border-b border-slate-800 px-8 bg-slate-900/50">
                        <button
                            onClick={() => setActiveTab('info')}
                            className={cn(
                                "px-6 py-4 text-sm font-bold border-b-2 transition-all",
                                activeTab === 'info'
                                    ? "border-primary-500 text-primary-400 bg-primary-500/5"
                                    : "border-transparent text-slate-500 hover:text-slate-300"
                            )}
                        >
                            <span className="flex items-center gap-2">
                                <Award size={16} /> Thông tin chuyên môn
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('reviews')}
                            className={cn(
                                "px-6 py-4 text-sm font-bold border-b-2 transition-all",
                                activeTab === 'reviews'
                                    ? "border-primary-500 text-primary-400 bg-primary-500/5"
                                    : "border-transparent text-slate-500 hover:text-slate-300"
                            )}
                        >
                            <span className="flex items-center gap-2">
                                <MessageSquare size={16} /> Đánh giá ({reviews.length})
                            </span>
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        {activeTab === 'info' ? (
                            <div className="space-y-10 max-w-3xl">
                                {/* Bio Section */}
                                <section className="space-y-4">
                                    <h3 className="text-lg font-bold text-slate-50 flex items-center gap-3">
                                        <Heart size={20} className="text-primary-500" /> Giới thiệu
                                    </h3>
                                    <p className="text-slate-300 leading-relaxed italic text-lg">
                                        "{doctor.bio || 'Bác sĩ tận tâm với sức khỏe cộng đồng, luôn lắng nghe và thấu hiểu bệnh nhân.'}"
                                    </p>
                                </section>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    {/* Education */}
                                    <section className="space-y-4">
                                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <GraduationCap size={16} className="text-primary-500" /> Học vấn
                                        </h3>
                                        <ul className="space-y-4">
                                            {doctor.education && doctor.education.length > 0 ? (
                                                doctor.education.map((item, idx) => (
                                                    <li key={idx} className="flex gap-4">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 shrink-0" />
                                                        <span className="text-slate-100 font-medium">{item}</span>
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="text-slate-500 italic">Đang cập nhật thông tin học vấn...</li>
                                            )}
                                        </ul>
                                    </section>

                                    {/* Certifications */}
                                    <section className="space-y-4">
                                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Award size={16} className="text-primary-500" /> Chứng chỉ
                                        </h3>
                                        <ul className="space-y-4">
                                            {doctor.certifications && doctor.certifications.length > 0 ? (
                                                doctor.certifications.map((item, idx) => (
                                                    <li key={idx} className="flex gap-4">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                                                        <span className="text-slate-100 font-medium">{item}</span>
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="text-slate-500 italic">Đang cập nhật thông tin chứng chỉ...</li>
                                            )}
                                        </ul>
                                    </section>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8 max-w-3xl">
                                {reviews.length > 0 ? (
                                    <div className="divide-y divide-slate-800">
                                        {reviews.map((review) => (
                                            <div key={review.id} className="py-6 first:pt-0 last:pb-0">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <div className="font-bold text-slate-50">{review.patientName}</div>
                                                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                                                            <Calendar size={12} />
                                                            {format(new Date(review.createdAt), 'dd MMMM, yyyy', { locale: vi })}
                                                        </div>
                                                    </div>
                                                    <StarRating rating={review.rating} size={14} />
                                                </div>
                                                <p className="text-slate-300 mt-3 text-sm leading-relaxed">
                                                    {review.comment || <span className="italic text-slate-500">Người bệnh không để lại nhận xét.</span>}
                                                </p>
                                                {review.adminResponse && (
                                                    <div className="mt-4 bg-primary-900/10 border-l-4 border-primary-500 p-4 rounded-r-xl">
                                                        <div className="text-[10px] font-bold text-primary-400 uppercase tracking-widest mb-1">ClinicPro Phản hồi:</div>
                                                        <p className="text-xs text-slate-400 italic">"{review.adminResponse}"</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-20 text-center bg-slate-800/20 rounded-3xl border border-dashed border-slate-800">
                                        <MessageSquare size={48} className="mx-auto text-slate-700 mb-4" />
                                        <h3 className="text-lg font-bold text-slate-400">Chưa có đánh giá nào</h3>
                                        <p className="text-slate-600 max-w-xs mx-auto mt-2 italic">Trở thành người bệnh đầu tiên đặt lịch và chia sẻ cảm nhận về BS. {doctor.fullName}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer Action */}
                    <div className="p-6 border-t border-slate-800 bg-slate-900 flex justify-between items-center px-8">
                        <p className="text-xs text-slate-500 flex items-center gap-2">
                            <Calendar size={14} /> Lịch khám gần nhất: <strong>Sáng thứ 2 hàng tuần</strong>
                        </p>
                        <Button onClick={onClose} variant="outline" className="px-10">Đóng</Button>
                    </div>
                </div>
            ) : (
                <div className="py-20 text-center">
                    <p className="text-slate-500 italic">Không thể tải thông tin bác sĩ. Vui lòng thử lại sau.</p>
                </div>
            )}
        </Modal>
    );
};
