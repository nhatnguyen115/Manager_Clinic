import { cn } from '@utils';

interface TimeSlotPickerProps {
    slots: string[];
    selectedSlot?: string;
    onSelect: (slot: string) => void;
    disabledSlots?: string[];
    className?: string;
}

export const TimeSlotPicker = ({
    slots,
    selectedSlot,
    onSelect,
    disabledSlots = [],
    className,
}: TimeSlotPickerProps) => {
    return (
        <div className={cn("grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3", className)}>
            {slots.map((slot) => {
                const isSelected = selectedSlot === slot;
                const isDisabled = disabledSlots.includes(slot);

                return (
                    <button
                        key={slot}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => onSelect(slot)}
                        className={cn(
                            "group relative py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 border overflow-hidden",
                            isSelected
                                ? "bg-primary-600 border-primary-500 text-white shadow-xl shadow-primary-900/40 scale-105 z-10"
                                : isDisabled
                                    ? "bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed grayscale"
                                    : "bg-slate-800 border-slate-700/50 text-slate-100 hover:border-primary-500/50 hover:bg-slate-700 hover:text-primary-400 active:scale-95"
                        )}
                    >
                        {/* Selected Indicator Glow */}
                        {isSelected && (
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent animate-pulse" />
                        )}

                        <div className="relative flex items-center justify-center gap-2">
                            <span>{slot}</span>
                        </div>
                    </button>
                );
            })}
        </div>
    );
};
