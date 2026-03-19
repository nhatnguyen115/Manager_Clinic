import { Send } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
    onSend: (message: string) => void;
    isLoading: boolean;
}

export const ChatInput = ({ onSend, isLoading }: ChatInputProps) => {
    const [text, setText] = useState('');
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const handleSend = () => {
        if (text.trim() && !isLoading) {
            onSend(text);
            setText('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Auto-resize textarea
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
        }
    }, [text]);

    return (
        <div className="p-4 bg-slate-900/50 border-t border-slate-800">
            <div className="relative flex items-end gap-2 bg-slate-800 rounded-xl border border-slate-700 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/20 transition-all">
                <textarea
                    ref={inputRef}
                    rows={1}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-slate-200 p-3 resize-none max-h-[120px] scrollbar-hide py-[10px]"
                    disabled={isLoading}
                />
                
                <button
                    onClick={handleSend}
                    disabled={!text.trim() || isLoading}
                    className="p-2.5 mb-1 mr-1 text-indigo-400 hover:text-indigo-300 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
                >
                    <Send size={20} className={isLoading ? "animate-pulse" : ""} />
                </button>
            </div>
        </div>
    );
};
