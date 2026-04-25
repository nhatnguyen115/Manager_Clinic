import { MapPin, Stethoscope, Calendar, CheckCircle2 } from 'lucide-react';
import { cn } from '@utils';

interface Step {
    id: number;
    name: string;
    icon: any;
}

const steps: Step[] = [
    { id: 1, name: 'Chuyên khoa', icon: Stethoscope },
    { id: 2, name: 'Bác sĩ', icon: MapPin },
    { id: 3, name: 'Thời gian', icon: Calendar },
    { id: 4, name: 'Xác nhận', icon: CheckCircle2 },
];

interface BookingStepperProps {
    currentStep: number;
    className?: string;
}

export const BookingStepper = ({ currentStep, className }: BookingStepperProps) => {
    return (
        <div className={cn("relative flex items-center justify-between w-full max-w-3xl mx-auto mb-12", className)}>
            {/* Background Line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -translate-y-1/2" />

            {/* Progress Line */}
            <div
                className="absolute top-1/2 left-0 h-0.5 bg-primary-500 -translate-y-1/2 transition-all duration-500 ease-in-out"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((step) => {
                const isCompleted = currentStep > step.id;
                const isActive = currentStep === step.id;
                const Icon = step.icon;

                return (
                    <div key={step.id} className="relative flex flex-col items-center group">
                        <div
                            className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10",
                                isCompleted
                                    ? "bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-900/40"
                                    : isActive
                                        ? "bg-slate-900 border-primary-500 text-primary-400 shadow-lg shadow-primary-900/20 scale-110"
                                        : "bg-slate-900 border-slate-700 text-slate-400"
                            )}
                        >
                            {isCompleted ? <CheckCircle2 size={20} /> : <Icon size={20} />}
                        </div>

                        <div className="absolute -bottom-7 w-max">
                            <span
                                className={cn(
                                    "text-xs font-bold uppercase tracking-wider transition-colors duration-300",
                                    isActive ? "text-primary-400" : isCompleted ? "text-slate-200" : "text-slate-500"
                                )}
                            >
                                {step.name}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
