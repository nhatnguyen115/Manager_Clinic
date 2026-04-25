import { useState } from 'react';
import { Modal } from '@components/ui/Modal';
import { Button } from '@components/ui/Button';
import { StarRating } from '@components/ui/StarRating';
import { useToast } from '@hooks/useToast';
import { createReview } from '@services/reviewService';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    doctorName: string;
    appointmentId: string;
}

export const ReviewModal = ({ isOpen, onClose, doctorName, appointmentId }: ReviewModalProps) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();

    const handleSubmit = async () => {
        if (rating === 0) {
            showToast.error('Vui lòng chọn số sao đánh giá');
            return;
        }

        try {
            setIsSubmitting(true);
            await createReview({
                appointmentId,
                rating,
                comment,
                isAnonymous
            });

            showToast.success('Cảm ơn bạn đã gửi đánh giá!');
            // Reset state
            setRating(0);
            setComment('');
            setIsAnonymous(false);
            onClose();
        } catch (error) {
            console.error('Failed to submit review:', error);
            showToast.error('Không thể gửi đánh giá. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Đánh giá dịch vụ">
            <div className="space-y-6">
                <div className="text-center">
                    <p className="text-slate-400">Trải nghiệm của bạn với bác sĩ</p>
                    <h4 className="text-xl font-bold text-slate-50 mt-1">{doctorName}</h4>
                </div>

                <div className="flex flex-col items-center py-4">
                    <StarRating
                        rating={rating}
                        interactive
                        size={44}
                        onRatingChange={setRating}
                    />
                    {rating > 0 && (
                        <p className="mt-2 text-warning font-bold animate-fade-in">
                            {rating}/5 sao — {
                                rating === 5 ? 'Tuyệt vời!' :
                                    rating === 4 ? 'Rất tốt' :
                                        rating === 3 ? 'Bình thường' :
                                            rating === 2 ? 'Kém' : 'Rất kém'
                            }
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Chia sẻ chi tiết (Tùy chọn)</label>
                    <textarea
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all h-32 resize-none"
                        placeholder="Hãy chia sẻ thêm về trải nghiệm của bạn (bác sĩ có tận tâm không, thời gian khám có đúng giờ không...)"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3 px-1">
                    <input
                        type="checkbox"
                        id="isAnonymous"
                        className="w-5 h-5 rounded-lg bg-slate-800 border-slate-700 text-primary-500 focus:ring-primary-500/30 transition-all cursor-pointer"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                    />
                    <label
                        htmlFor="isAnonymous"
                        className="text-sm font-medium text-slate-300 cursor-pointer select-none"
                    >
                        Gửi đánh giá ẩn danh
                    </label>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button variant="outline" fullWidth onClick={onClose} disabled={isSubmitting}>
                        Hủy
                    </Button>
                    <Button fullWidth onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
