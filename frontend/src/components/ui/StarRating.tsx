import { Star } from 'lucide-react';
import { cn } from '@utils';

interface StarRatingProps {
    rating: number;
    max?: number;
    onRatingChange?: (rating: number) => void;
    interactive?: boolean;
    size?: number;
    className?: string;
}

export const StarRating = ({
    rating,
    max = 5,
    onRatingChange,
    interactive = false,
    size = 20,
    className,
}: StarRatingProps) => {
    return (
        <div className={cn("flex items-center gap-1", className)}>
            {Array.from({ length: max }).map((_, i) => {
                const starValue = i + 1;
                const isActive = starValue <= rating;

                return (
                    <button
                        key={i}
                        type="button"
                        disabled={!interactive}
                        onClick={() => onRatingChange?.(starValue)}
                        className={cn(
                            "transition-all duration-200",
                            interactive ? "hover:scale-120 active:scale-95 cursor-pointer" : "cursor-default",
                            isActive ? "text-warning" : "text-slate-700 hover:text-slate-500"
                        )}
                    >
                        <Star
                            size={size}
                            strokeWidth={2}
                            fill={isActive ? "currentColor" : "transparent"}
                        />
                    </button>
                );
            })}
        </div>
    );
};
