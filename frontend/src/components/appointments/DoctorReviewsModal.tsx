import { useState, useEffect } from 'react';
import { Modal } from '@components/ui/Modal';
import { StarRating } from '@components/ui/StarRating';
import { getDoctorReviews } from '@services/reviewService';
import type { ReviewResponse } from '@/types';
import { Loading } from '@components/ui/Loading';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface DoctorReviewsModalProps {
    isOpen: boolean;
    onClose: () => void;
    doctorId: string;
    doctorName: string;
}

export const DoctorReviewsModal = ({ isOpen, onClose, doctorId, doctorName }: DoctorReviewsModalProps) => {
    const [reviews, setReviews] = useState<ReviewResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && doctorId) {
            const load = async () => {
                try {
                    setIsLoading(true);
                    const data = await getDoctorReviews(doctorId);
                    setReviews(data);
                } catch (error) {
                    console.error('Failed to load reviews:', error);
                } finally {
                    setIsLoading(false);
                }
            };
            load();
        }
    }, [isOpen, doctorId]);

    const averageRating = reviews.length > 0
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        : 0;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Đánh giá về ${doctorName}`} size="lg">
            {isLoading ? (
                <div className="py-12 flex justify-center">
                    <Loading text="Đang tải đánh giá..." />
                </div>
            ) : (
                <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                    {reviews.length > 0 ? (
                        <>
                            {/* Summary Stats */}
                            <div className="bg-dark-800/50 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 border border-dark-700">
                                <div className="text-center">
                                    <div className="text-5xl font-bold text-dark-50">{averageRating.toFixed(1)}</div>
                                    <StarRating rating={averageRating} size={24} className="mt-2 justify-center" />
                                    <div className="text-dark-400 text-sm mt-1">{reviews.length} đánh giá</div>
                                </div>
                                <div className="flex-1 w-full space-y-2">
                                    {[5, 4, 3, 2, 1].map((stars) => {
                                        const count = reviews.filter(r => r.rating === stars).length;
                                        const percentage = (count / reviews.length) * 100;
                                        return (
                                            <div key={stars} className="flex items-center gap-3">
                                                <div className="text-xs font-medium text-dark-300 w-4">{stars}</div>
                                                <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-warning transition-all duration-500"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                                <div className="text-xs text-dark-500 w-8">{count}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Review List */}
                            <div className="divide-y divide-dark-800">
                                {reviews.map((review) => (
                                    <div key={review.id} className="py-6 first:pt-0 last:pb-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="font-bold text-dark-50">{review.patientName}</div>
                                                <div className="text-xs text-dark-500">
                                                    {format(new Date(review.createdAt), 'dd MMMM, yyyy', { locale: vi })}
                                                </div>
                                            </div>
                                            <StarRating rating={review.rating} size={16} />
                                        </div>
                                        <p className="text-dark-200 mt-3 text-[15px] leading-relaxed">
                                            {review.comment || <span className="italic text-dark-500 text-sm">Không có nhận xét.</span>}
                                        </p>
                                        {review.adminResponse && (
                                            <div className="mt-4 bg-primary-900/10 border-l-4 border-primary-500 p-4 rounded-r-xl">
                                                <div className="text-xs font-bold text-primary-400 uppercase tracking-wider mb-1">
                                                    Phòng khám phản hồi:
                                                </div>
                                                <p className="text-sm text-dark-300">{review.adminResponse}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="py-20 text-center">
                            <div className="text-dark-600 mb-2">Chưa có đánh giá nào cho bác sĩ này.</div>
                            <p className="text-dark-500 text-sm">Trở thành người đầu tiên chia sẻ cảm nhận!</p>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
};
