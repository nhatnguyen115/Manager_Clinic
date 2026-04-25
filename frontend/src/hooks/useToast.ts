import toast from 'react-hot-toast';

export const useToast = () => {
    const showToast = {
        success: (message: string) =>
            toast.success(message, {
                className: 'bg-slate-800 text-slate-50 border border-slate-700',
            }),
        error: (message: string) =>
            toast.error(message, {
                className: 'bg-slate-800 text-slate-50 border border-slate-700',
            }),
        loading: (message: string) =>
            toast.loading(message, {
                className: 'bg-slate-800 text-slate-50 border border-slate-700',
            }),
        dismiss: () => toast.dismiss(),
    };

    return { showToast };
};
