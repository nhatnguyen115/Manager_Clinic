import apiClient from './apiClient';
import { ApiResponse, AuthResponse, User } from '@/types/auth';

export const authService = {
    login: async (credentials: any): Promise<ApiResponse<AuthResponse>> => {
        const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
        return response.data;
    },

    register: async (data: any): Promise<ApiResponse<User>> => {
        const response = await apiClient.post<ApiResponse<User>>('/auth/register', data);
        return response.data;
    },

    getCurrentUser: async (): Promise<ApiResponse<User>> => {
        const response = await apiClient.get<ApiResponse<User>>('/users/me');
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    },
};
