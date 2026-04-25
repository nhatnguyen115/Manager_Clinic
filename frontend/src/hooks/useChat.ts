import { useState, useCallback, useEffect } from 'react';
import { ChatMessage } from '../types/chat';
import chatService from '../services/chatService';
import { useAuth } from '../contexts/AuthContext';

export const useChat = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Khởi tạo tin nhắn chào mừng
    useEffect(() => {
        if (messages.length === 0 && user) {
            const welcomeMsg: ChatMessage = {
                id: 'welcome',
                role: 'assistant',
                content: `Xin chào ${user.fullName}! Em là trợ lý ảo của ClinicPro. Em có thể giúp gì cho anh/chị hôm nay?`,
                timestamp: new Date()
            };
            setMessages([welcomeMsg]);
        }
    }, [user, messages.length]);

    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim() || isLoading) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const response = await chatService.sendMessage(content);
            const assistantMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.message,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, assistantMsg]);
        } catch (error) {
            const errorMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Rất tiếc, đã có lỗi xảy ra khi kết nối với máy chủ. Vui lòng thử lại sau.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading]);

    const toggleChat = () => setIsOpen(!isOpen);

    return {
        messages,
        isLoading,
        isOpen,
        sendMessage,
        toggleChat
    };
};
