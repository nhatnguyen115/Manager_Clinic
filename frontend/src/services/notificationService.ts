import axios from 'axios';
import { ApiResponse, Notification, PaginatedData } from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

export const notificationService = {
    getNotifications: async (page = 0, size = 10) => {
        const token = localStorage.getItem('access_token');
        const response = await axios.get<ApiResponse<PaginatedData<Notification>>>(
            `${API_BASE_URL}/notifications`, {
            params: { page, size },
            headers: { Authorization: `Bearer ${token}` }
        }
        );
        return response.data;
    },

    getUnreadCount: async () => {
        const token = localStorage.getItem('access_token');
        const response = await axios.get<ApiResponse<number>>(
            `${API_BASE_URL}/notifications/unread-count`, {
            headers: { Authorization: `Bearer ${token}` }
        }
        );
        return response.data;
    },

    markAsRead: async (notificationId: string) => {
        const token = localStorage.getItem('access_token');
        const response = await axios.patch<ApiResponse<void>>(
            `${API_BASE_URL}/notifications/${notificationId}/read`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        }
        );
        return response.data;
    },

    markAllAsRead: async () => {
        const token = localStorage.getItem('access_token');
        const response = await axios.patch<ApiResponse<void>>(
            `${API_BASE_URL}/notifications/read-all`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        }
        );
        return response.data;
    }
};
