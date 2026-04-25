import apiClient from './apiClient';
import { ChatRequest, ChatResponse } from '../types/chat';

const chatService = {
    sendMessage: async (message: string): Promise<ChatResponse> => {
        const response = await apiClient.post<ChatResponse>('/chat', { message } as ChatRequest);
        return response.data;
    }
};

export default chatService;
