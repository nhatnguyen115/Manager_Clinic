import { MessageSquare, X } from 'lucide-react';
import { ChatPanel } from './ChatPanel';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { clsx } from 'clsx';

/**
 * ChatWidget component - Entry point for the AI Chatbot on the Frontend.
 * It floats at the bottom right and toggles the ChatPanel.
 */
export const ChatWidget = () => {
    const { isAuthenticated } = useAuth();
    const { isOpen, toggleChat, messages, isLoading, sendMessage } = useChat();

    // Chỉ hiển thị ChatWidget khi người dùng đã đăng nhập
    if (!isAuthenticated) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[9999]">
            {/* Chat Panel */}
            {isOpen && (
                <ChatPanel 
                    messages={messages}
                    isLoading={isLoading}
                    onSendMessage={sendMessage}
                    onClose={toggleChat}
                />
            )}

            {/* Floating Toggle Button */}
            <button
                onClick={toggleChat}
                className={clsx(
                    "w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform active:scale-90 relative overflow-hidden group",
                    isOpen 
                        ? "bg-slate-800 text-slate-200 rotate-90" 
                        : "bg-indigo-600 text-white hover:bg-indigo-500 hover:-translate-y-1"
                )}
            >
                {/* Glow effect */}
                {!isOpen && (
                    <span className="absolute inset-0 bg-indigo-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
                )}
                
                {isOpen ? (
                    <X size={24} className="animate-in fade-in duration-300" />
                ) : (
                    <MessageSquare size={24} className="animate-in zoom-in duration-300" />
                )}

                {/* Unread dot indicator (optional) */}
                {!isOpen && messages.length > 1 && (
                    <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 border-2 border-indigo-600 rounded-full animate-bounce" />
                )}
            </button>
        </div>
    );
};
