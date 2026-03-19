import { useRef, useEffect } from 'react';
import { X, Minus, Sparkles } from 'lucide-react';
import { ChatBubble } from './ChatBubble';
import { ChatInput } from './ChatInput';
import { QuickReplies } from './QuickReplies';
import { ChatMessage } from '@/types/chat';

interface ChatPanelProps {
    messages: ChatMessage[];
    isLoading: boolean;
    onSendMessage: (msg: string) => void;
    onClose: () => void;
}

export const ChatPanel = ({ messages, isLoading, onSendMessage, onClose }: ChatPanelProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    return (
        <div className="fixed bottom-20 right-4 w-[380px] h-[550px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)] bg-slate-900 border border-slate-700/50 shadow-2xl rounded-2xl flex flex-col overflow-hidden z-50 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 bg-indigo-600 flex items-center justify-between text-white shadow-lg">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <Sparkles size={18} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm">Trợ lý ClinicPro</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-sm shadow-green-400/50" />
                            <span className="text-[10px] text-indigo-100 opacity-90 uppercase tracking-widest font-medium">Đang trực tuyến</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                        <Minus size={18} />
                    </button>
                    <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 scroll-smooth scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
            >
                {messages.map((msg) => (
                    <ChatBubble key={msg.id} message={msg} />
                ))}
                
                {isLoading && (
                    <div className="flex justify-start mb-4 animate-pulse">
                        <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-700/50 text-slate-400 text-xs flex items-center gap-2">
                             <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" />
                             <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                             <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                             <span>AI đang suy nghĩ...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Area */}
            <QuickReplies onSelect={onSendMessage} disabled={isLoading} />
            <ChatInput onSend={onSendMessage} isLoading={isLoading} />
        </div>
    );
};
