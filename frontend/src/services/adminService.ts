import apiClient from './apiClient';
import {
    AdminDashboardStats,
    UserProfileResponse as UserResponse,
    AdminUserRequest,
    AppointmentResponse,
    AdminAppointmentFilters,
    DoctorResponse,
    DoctorRequest,
    PatientResponse,
    PatientRequest,
    SpecialtyResponse,
    MedicalRecordResponse
} from '../types';
import { ApiResponse } from '@/types/auth';

const adminService = {
    // Dashboard Stats
    getDashboardStats: async (): Promise<AdminDashboardStats> => {
        const response = await apiClient.get<ApiResponse<AdminDashboardStats>>('/admin/dashboard/stats');
        return response.data.result;
    },

    // User Management
    getAllUsers: async (role?: string, search?: string): Promise<UserResponse[]> => {
        const response = await apiClient.get<ApiResponse<UserResponse[]>>('/admin/users', {
            params: { role, search }
        });
        return response.data.result;
    },

    createUser: async (data: AdminUserRequest): Promise<UserResponse> => {
        const response = await apiClient.post<ApiResponse<UserResponse>>('/admin/users', data);
        return response.data.result;
    },

    updateUser: async (id: string, data: AdminUserRequest): Promise<UserResponse> => {
        const response = await apiClient.put<ApiResponse<UserResponse>>(`/admin/users/${id}`, data);
        return response.data.result;
    },

    toggleUserActive: async (id: string): Promise<UserResponse> => {
        const response = await apiClient.put<ApiResponse<UserResponse>>(`/admin/users/${id}/toggle-active`);
        return response.data.result;
    },

    resetPassword: async (id: string): Promise<void> => {
        await apiClient.put(`/admin/users/${id}/reset-password`);
    },

    // Appointment Management
    getAllAppointments: async (filters: AdminAppointmentFilters): Promise<AppointmentResponse[]> => {
        const response = await apiClient.get<ApiResponse<AppointmentResponse[]>>('/admin/appointments', {
            params: filters
        });
        return response.data.result;
    },

    updateAppointmentStatus: async (id: string, status: string): Promise<AppointmentResponse> => {
        const response = await apiClient.put<ApiResponse<AppointmentResponse>>(`/appointments/${id}/status`, { status });
        return response.data.result;
    },

    cancelAppointment: async (id: string, reason: string): Promise<AppointmentResponse> => {
        const response = await apiClient.put<ApiResponse<AppointmentResponse>>(`/appointments/${id}/cancel`, { reason });
        return response.data.result;
    },

    // Doctor Management
    getAllDoctors: async (specialtyId?: string): Promise<DoctorResponse[]> => {
        const response = await apiClient.get<ApiResponse<DoctorResponse[]>>('/doctors', {
            params: { specialtyId }
        });
        return response.data.result;
    },

    getDoctorById: async (id: string): Promise<DoctorResponse> => {
        const response = await apiClient.get<ApiResponse<DoctorResponse>>(`/doctors/${id}`);
        return response.data.result;
    },

    updateDoctor: async (id: string, data: DoctorRequest): Promise<DoctorResponse> => {
        const response = await apiClient.put<ApiResponse<DoctorResponse>>(`/doctors/${id}`, data);
        return response.data.result;
    },

    // Patient Management
    getAllPatients: async (): Promise<PatientResponse[]> => {
        const response = await apiClient.get<ApiResponse<PatientResponse[]>>('/patients');
        return response.data.result;
    },

    getPatientById: async (id: string): Promise<PatientResponse> => {
        const response = await apiClient.get<ApiResponse<PatientResponse>>(`/patients/${id}`);
        return response.data.result;
    },

    updatePatient: async (id: string, data: PatientRequest): Promise<PatientResponse> => {
        const response = await apiClient.put<ApiResponse<PatientResponse>>(`/patients/${id}`, data);
        return response.data.result;
    },

    getPatientRecords: async (patientId: string): Promise<MedicalRecordResponse[]> => {
        const response = await apiClient.get<ApiResponse<MedicalRecordResponse[]>>(`/medical-records/patient/${patientId}`);
        return response.data.result;
    },

    // Export Data (returns Blob)
    exportUsers: async (): Promise<void> => {
        const response = await apiClient.get('/admin/export/users', { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    },

    exportPatients: async (): Promise<void> => {
        const response = await apiClient.get('/admin/export/patients', { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `patients_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    },

    exportAppointments: async (dateFrom?: string, dateTo?: string): Promise<void> => {
        const response = await apiClient.get('/admin/export/appointments', {
            params: { dateFrom, dateTo },
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `appointments_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    },

    // Specialty Management
    getAllSpecialtiesAdmin: async (): Promise<SpecialtyResponse[]> => {
        const response = await apiClient.get<ApiResponse<SpecialtyResponse[]>>('/specialties/admin');
        return response.data.result;
    },

    createSpecialty: async (data: { name: string; description?: string }): Promise<SpecialtyResponse> => {
        const response = await apiClient.post<ApiResponse<SpecialtyResponse>>('/specialties', data);
        return response.data.result;
    },

    updateSpecialty: async (id: string, data: { name: string; description?: string }): Promise<SpecialtyResponse> => {
        const response = await apiClient.put<ApiResponse<SpecialtyResponse>>(`/specialties/${id}`, data);
        return response.data.result;
    },

    deleteSpecialty: async (id: string): Promise<void> => {
        await apiClient.delete(`/specialties/${id}`);
    },

    // Doctor Specialty Management
    updateDoctorSpecialty: async (doctorId: string, specialtyId: string | null): Promise<DoctorResponse> => {
        const response = await apiClient.put<ApiResponse<DoctorResponse>>(`/admin/doctors/${doctorId}/specialty`, null, {
            params: { specialtyId }
        });
        return response.data.result;
    },

    getDoctorsNoSpecialty: async (): Promise<DoctorResponse[]> => {
        const response = await apiClient.get<ApiResponse<DoctorResponse[]>>('/admin/doctors/no-specialty');
        return response.data.result;
    },

    // Reports & Statistics
    getSummaryReport: async (from?: string, to?: string): Promise<any> => {
        const response = await apiClient.get<ApiResponse<any>>('/reports/summary', {
            params: { from, to }
        });
        return response.data.result;
    },

    exportReportPdf: async (from?: string, to?: string): Promise<void> => {
        const response = await apiClient.get('/reports/export/pdf', {
            params: { from, to },
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `bao_cao_tong_quan_${new Date().toISOString().split('T')[0]}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    },

    exportReportExcel: async (from?: string, to?: string): Promise<void> => {
        const response = await apiClient.get('/reports/export/excel', {
            params: { from, to },
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `bao_cao_tong_quan_${new Date().toISOString().split('T')[0]}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
};

export default adminService;
