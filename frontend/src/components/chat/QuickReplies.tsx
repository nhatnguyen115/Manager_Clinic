interface QuickRepliesProps {
    onSelect: (reply: string) => void;
    disabled: boolean;
}

const REPLIES = [
    "Xem chuyên khoa",
    "Tìm bác sĩ",
    "Lịch làm việc bác sĩ",
    "Tra cứu thuốc",
    "Lịch hẹn của tôi"
];

export const QuickReplies = ({ onSelect, disabled }: QuickRepliesProps) => {
    return (
        <div className="flex flex-wrap gap-2 px-4 py-3">
            {REPLIES.map((reply) => (
                <button
                    key={reply}
                    onClick={() => onSelect(reply)}
                    disabled={disabled}
                    className="px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 text-slate-300 rounded-full hover:bg-slate-700 hover:border-indigo-500/30 hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {reply}
                </button>
            ))}
        </div>
    );
};
