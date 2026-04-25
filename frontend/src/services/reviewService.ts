import apiClient from './apiClient';
import type { ReviewResponse } from '@/types';
import type { ApiResponse } from '@/types/auth';

export const createReview = async (data: {
    appointmentId: string;
    rating: number;
    comment?: string;
    isAnonymous?: boolean;
}) => {
    const response = await apiClient.post<ApiResponse<ReviewResponse>>('/reviews', data);
    return response.data.result;
};

export const getDoctorReviews = async (doctorId: string) => {
    const response = await apiClient.get<ApiResponse<ReviewResponse[]>>(`/doctors/${doctorId}/reviews`);
    return response.data.result || [];
};

export const updateReview = async (id: string, data: {
    rating: number;
    comment?: string;
    isAnonymous?: boolean;
}) => {
    const response = await apiClient.put<ApiResponse<ReviewResponse>>(`/reviews/${id}`, data);
    return response.data.result;
};

export const deleteReview = async (id: string) => {
    await apiClient.delete(`/reviews/${id}`);
};
