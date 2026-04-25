import apiClient from './apiClient';
import type {
    AppointmentResponse,
    DoctorDashboardStats,
    PatientResponse,
    MedicalRecordResponse,
    MedicineResponse,
    ReviewResponse,
    Schedule,
} from '@/types';

// ============================================
// Doctor Service - API calls for Doctor Portal
// ============================================

// ─── Appointments ───

export const getMyAppointments = async (): Promise<AppointmentResponse[]> => {
    const response = await apiClient.get('/appointments/me');
    return response.data.result || [];
};

export const getTodayAppointments = async (): Promise<AppointmentResponse[]> => {
    const allAppointments = await getMyAppointments();
    const today = new Date().toISOString().split('T')[0];
    return allAppointments.filter(
        (apt) => apt.appointmentDate === today || apt.appointmentDate?.startsWith(today)
    );
};

export const getDashboardStats = async (): Promise<DoctorDashboardStats> => {
    const appointments = await getMyAppointments();
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const todayAppointments = appointments.filter(
        (apt) => apt.appointmentDate === today
    ).length;

    const weekAppointments = appointments.filter((apt) => {
        const date = new Date(apt.appointmentDate || '');
        return date >= startOfWeek && date <= endOfWeek;
    }).length;

    const monthAppointments = appointments.filter((apt) => {
        const date = new Date(apt.appointmentDate || '');
        return date >= startOfMonth && date <= endOfMonth;
    }).length;

    const uniquePatients = new Set(
        appointments.map((apt) => apt.patientId).filter(Boolean)
    );

    const pendingAppointments = appointments.filter(
        (apt) => apt.status === 'PENDING'
    ).length;

    const completedAppointments = appointments.filter(
        (apt) => apt.status === 'COMPLETED'
    ).length;

    return {
        todayAppointments,
        weekAppointments,
        monthAppointments,
        totalPatients: uniquePatients.size,
        averageRating: 0,
        pendingAppointments,
        completedAppointments,
    };
};

export const updateAppointmentStatus = async (
    appointmentId: string,
    status: string
): Promise<AppointmentResponse> => {
    const response = await apiClient.put(`/appointments/${appointmentId}/status`, {
        status,
    });
    return response.data.result;
};

export const cancelAppointment = async (
    appointmentId: string,
    reason: string
): Promise<AppointmentResponse> => {
    const response = await apiClient.put(`/appointments/${appointmentId}/cancel`, {
        reason,
    });
    return response.data.result;
};

// ─── Reviews ───

export const getDoctorReviews = async (doctorId: string): Promise<ReviewResponse[]> => {
    try {
        const response = await apiClient.get(`/doctors/${doctorId}/reviews`);
        return response.data.result || [];
    } catch {
        return [];
    }
};

// ─── Schedule ───

export const getMySchedule = async (doctorId: string): Promise<Schedule[]> => {
    const response = await apiClient.get(`/doctors/${doctorId}/schedule`);
    return response.data.result || [];
};

export const updateMySchedule = async (
    doctorId: string,
    schedules: Schedule[]
): Promise<Schedule[]> => {
    const response = await apiClient.put(`/doctors/${doctorId}/schedule`, schedules);
    return response.data.result || [];
};

// ─── Patients ───

export const getAllPatients = async (): Promise<PatientResponse[]> => {
    const response = await apiClient.get('/patients');
    return response.data.result || [];
};

export const getMyPatients = async (): Promise<PatientResponse[]> => {
    const response = await apiClient.get('/patients/my-patients');
    return response.data.result || [];
};

export const getPatientById = async (id: string): Promise<PatientResponse> => {
    const response = await apiClient.get(`/patients/${id}`);
    return response.data.result;
};

// ─── Medical Records ───

export const getPatientRecords = async (patientId: string): Promise<MedicalRecordResponse[]> => {
    const response = await apiClient.get(`/medical-records/patient/${patientId}`);
    return response.data.result || [];
};

export const createMedicalRecord = async (data: {
    appointmentId: string;
    diagnosis: string;
    symptoms?: string;
    vitalSigns?: any;
    treatment?: string;
    notes?: string;
    followUpDate?: string;
    actualFee: number;
    prescriptionDetails?: {
        medicineId: number;
        dosage: string;
        frequency: string;
        duration?: string;
        instructions?: string;
        quantity: number;
    }[];
}): Promise<MedicalRecordResponse> => {
    const response = await apiClient.post('/medical-records', data);
    return response.data.result;
};

export const updateMedicalRecord = async (
    id: string,
    data: {
        appointmentId: string;
        diagnosis: string;
        symptoms?: string;
        vitalSigns?: any;
        treatment?: string;
        notes?: string;
        followUpDate?: string;
        actualFee: number;
        prescriptionDetails?: {
            medicineId: number;
            dosage: string;
            frequency: string;
            duration?: string;
            instructions?: string;
            quantity: number;
        }[];
    }
): Promise<MedicalRecordResponse> => {
    const response = await apiClient.put(`/medical-records/${id}`, data);
    return response.data.result;
};

// ─── Medicines ───

export const getAllMedicines = async (): Promise<MedicineResponse[]> => {
    const response = await apiClient.get('/medicines');
    return response.data.result || [];
};

export default {
    getMyAppointments,
    getTodayAppointments,
    getDashboardStats,
    getDoctorReviews,
    updateAppointmentStatus,
    cancelAppointment,
    getMySchedule,
    updateMySchedule,
    getAllPatients,
    getPatientById,
    getPatientRecords,
    createMedicalRecord,
    updateMedicalRecord,
    getAllMedicines,
    getMyPatients,
};
