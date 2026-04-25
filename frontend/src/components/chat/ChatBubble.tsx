import { ChatMessage } from '@/types/chat';
import { Bot, User } from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ChatBubbleProps {
    message: ChatMessage;
}

export const ChatBubble = ({ message }: ChatBubbleProps) => {
    const isAssistant = message.role === 'assistant';

    return (
        <div className={clsx(
            "flex w-full mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
            isAssistant ? "justify-start" : "justify-end"
        )}>
            <div className={clsx(
                "flex max-w-[80%] items-start gap-2",
                !isAssistant && "flex-row-reverse"
            )}>
                <div className={clsx(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center p-1.5",
                    isAssistant ? "bg-indigo-600 text-white" : "bg-slate-700 text-slate-300"
                )}>
                    {isAssistant ? <Bot size={18} /> : <User size={18} />}
                </div>

                <div className="flex flex-col gap-1">
                    <div className={clsx(
                        "p-3 rounded-2xl text-sm leading-relaxed",
                        isAssistant 
                            ? "bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/50" 
                            : "bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-900/20"
                    )}>
                        {message.content.split('\n').map((line, i) => (
                            <p key={i} className={i > 0 ? "mt-1" : ""}>{line}</p>
                        ))}
                    </div>
                    
                    <span className={clsx(
                        "text-[10px] text-slate-500 px-1",
                        !isAssistant && "text-right"
                    )}>
                        {format(message.timestamp, 'HH:mm', { locale: vi })}
                    </span>
                </div>
            </div>
        </div>
    );
};
