// ============================================
// ClinicPro - Type Definitions
// ============================================

// User & Auth Types
export interface User {
    id: string;
    email: string;
    fullName: string;
    phone?: string;
    avatar?: string;
    role: UserRole;
    isActive: boolean;
    createdAt: string;
    doctorId?: string;
    patientId?: string;
}

export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export interface Patient extends User {
    dateOfBirth?: string;
    gender?: Gender;
    address?: string;
}

export interface Doctor extends User {
    specialty: Specialty;
    licenseNumber: string;
    experience: number;
    rating: number;
    reviewCount: number;
    bio?: string;
    consultationFee: number;
}

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

// Specialty
export interface Specialty {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    doctorCount?: number;
}

// Appointment Types
export interface Appointment {
    id: string;
    patient: Patient;
    doctor: Doctor;
    timeSlot: TimeSlot;
    symptoms?: string;
    notes?: string;
    status: AppointmentStatus;
    createdAt: string;
}

export type AppointmentStatus =
    | 'PENDING'
    | 'CONFIRMED'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'NO_SHOW';

export interface TimeSlot {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
}

export interface WorkingSchedule {
    id: string;
    doctorId: string;
    dayOfWeek: number; // 0 = Sunday, 6 = Saturday
    startTime: string;
    endTime: string;
    slotDuration: number; // minutes
    isActive: boolean;
}

// Medical Records
export interface MedicalRecord {
    id: string;
    appointment: Appointment;
    diagnosis: string;
    symptoms: string;
    treatment?: string;
    notes?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface Prescription {
    id: string;
    medicalRecord: MedicalRecord;
    details: PrescriptionDetail[];
    notes?: string;
    createdAt: string;
}

export interface PrescriptionDetail {
    id: string;
    medicine: Medicine;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
}

export interface Medicine {
    id: string;
    name: string;
    description?: string;
    unit: string;
    price: number;
}

// Payment Types
export interface Payment {
    id: string;
    appointment: Appointment;
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
    transactionId?: string;
    paidAt?: string;
    createdAt: string;
}

export type PaymentMethod = 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'MOMO' | 'VNPAY';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

// Review Types
export interface Review {
    id: string;
    patient: Patient;
    doctor: Doctor;
    appointment: Appointment;
    rating: number;
    comment?: string;
    createdAt: string;
}

// News Types
export interface News {
    id: string;
    title: string;
    content: string;
    summary?: string;
    thumbnail?: string;
    author: User;
    isPublished: boolean;
    publishedAt?: string;
    createdAt: string;
}

// Notification Types
export interface Notification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    isRead: boolean;
    relatedEntityType?: string;
    relatedEntityId?: string;
    createdAt: string;
}

export type NotificationType = 'APPOINTMENT' | 'PAYMENT' | 'SYSTEM' | 'REMINDER';

// Common Types
export interface Pagination {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

export interface PaginatedData<T> {
    content: T[];
    pagination: Pagination;
}

// Auth Types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role?: UserRole;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

// Doctor Dashboard Types
export interface DoctorDashboardStats {
    todayAppointments: number;
    weekAppointments: number;
    monthAppointments: number;
    totalPatients: number;
    averageRating: number;
    pendingAppointments: number;
    completedAppointments: number;
}

// Schedule Types (matches backend ScheduleResponse / ScheduleUpdateRequest)
export interface ScheduleTimeSlot {
    id?: number;
    startTime: string;  // "HH:mm"
    endTime: string;     // "HH:mm"
    maxPatients: number;
    isAvailable: boolean;
}

export interface Schedule {
    id?: number;
    dayOfWeek: number;        // 0=Sunday, 1=Monday ... 6=Saturday
    specificDate?: string;     // ISO date for overrides / leave days
    isAvailable: boolean;
    notes?: string;
    timeSlots: ScheduleTimeSlot[];
}

export interface LeaveDay {
    date: string;
    reason: string;
}

// Form Types
export interface SelectOption {
    value: string;
    label: string;
}

// ============================================
// Backend Response Types (match actual API DTOs)
// ============================================

export interface ApiResponse<T> {
    code: number;
    message?: string;
    result: T;
}

// Matches AppointmentResponse.java
export interface AppointmentResponse {
    id: string;
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    specialtyId?: string;
    specialtyName?: string;
    timeSlotId?: number;
    appointmentDate: string;   // "2026-02-14"
    appointmentTime: string;   // "09:00"
    status: AppointmentStatus;
    symptoms?: string;
    notes?: string;
    consultationFee?: number;
    actualFee?: number;
    cancelledBy?: string;
    cancelledReason?: string;
    confirmedAt?: string;
    completedAt?: string;
    createdAt: string;
    updatedAt?: string;
}


// Matches PatientResponse.java
export interface PatientResponse {
    id: string;
    userId: string;
    fullName: string;
    email: string;
    dateOfBirth?: string;
    gender?: string;
    phoneNumber?: string;
    address?: string;
    city?: string;
    bloodType?: string;
    allergies?: string[];
    chronicDiseases?: string[];
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    insuranceNumber?: string;
    isActive: boolean;
}

export interface PatientRequest {
    fullName: string;
    dateOfBirth?: string;
    gender?: string;
    phoneNumber?: string;
    address?: string;
    city?: string;
    bloodType?: string;
    allergies?: string[];
    chronicDiseases?: string[];
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    insuranceNumber?: string;
}

// Matches MedicalRecordResponse.java
export interface MedicalRecordResponse {
    id: string;
    appointmentId: string;
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    diagnosis: string;
    symptoms: string;
    vitalSigns?: Record<string, any>;
    treatment?: string;
    notes?: string;
    followUpDate?: string;
    actualFee?: number;
    attachments?: string[];
    prescription?: PrescriptionResponse;
    createdAt: string;
    updatedAt?: string;
}

export interface PrescriptionResponse {
    id: string;
    prescriptionNumber: string;
    notes?: string;
    validUntil?: string;
    details: PrescriptionDetailResponse[];
    createdAt: string;
}

export interface PrescriptionDetailResponse {
    id: number;
    medicineId: number;
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
    quantity: number;
    createdAt?: string;
}

// Matches MedicineResponse.java
export interface MedicineResponse {
    id: number;
    name: string;
    genericName?: string;
    dosageForm?: string;
    strength?: string;
    manufacturer?: string;
    description?: string;
    sideEffects?: string;
    contraindications?: string;
    isPrescription?: boolean;
    isActive?: boolean;
}

// Matches ReviewResponse.java
export interface ReviewResponse {
    id: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    rating: number;
    comment?: string;
    isAnonymous?: boolean;
    adminResponse?: string;
    createdAt: string;
}

// Matches SpecialtyResponse.java
export interface SpecialtyResponse {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    isActive?: boolean;
    displayOrder?: number;
    doctorCount?: number;
}

// Matches DoctorResponse.java
export interface DoctorResponse {
    id: string;
    userId: string;
    fullName: string;
    email?: string;
    phoneNumber?: string;
    avatarUrl?: string;
    bio?: string;
    experienceYears?: number;
    licenseNumber?: string;
    consultationFee?: number;
    isAvailable?: boolean;
    specialtyName?: string;
    specialtyId?: string;
    avgRating?: number;
    totalReviews?: number;
    education?: string[];
    certifications?: string[];
    isActive: boolean;
}

export interface DoctorRequest {
    fullName: string;
    phoneNumber?: string;
    bio?: string;
    experienceYears?: number;
    licenseNumber?: string;
    consultationFee?: number;
    isAvailable?: boolean;
    specialtyId?: string;
    userId?: string;
    education?: string[];
    certifications?: string[];
}

// Matches TimeSlotResponse.java
export interface TimeSlotResponse {
    id: number;
    startTime: string;  // "HH:mm"
    endTime: string;    // "HH:mm"
    maxPatients?: number;
    isAvailable?: boolean;
}

// Matches UserResponse.java (for profile)
export interface UserProfileResponse {
    id: string;
    email: string;
    fullName: string;
    phone?: string;
    avatarUrl?: string;
    role: string;
    isActive: boolean;
    doctorId?: string;
    patientId?: string;

    bio?: string;
    experienceYears?: number;
    licenseNumber?: string;
    consultationFee?: number;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    city?: string;
    bloodType?: string;
    allergies?: string[];
    chronicDiseases?: string[];
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    insuranceNumber?: string;
    education?: string[];
    certifications?: string[];
    specialtyName?: string;
    specialtyId?: string;
}

export interface ProfileUpdateRequest {
    fullName: string;
    phone?: string;
    avatarUrl?: string;

    // Doctor specific
    bio?: string;
    experienceYears?: number;
    licenseNumber?: string;
    consultationFee?: number;
    education?: string[];
    certifications?: string[];
    specialtyId?: string;

    // Patient specific
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    city?: string;
    bloodType?: string;
    allergies?: string[];
    chronicDiseases?: string[];
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    insuranceNumber?: string;
}
// Admin Dashboard Types
export interface MonthlyStatItem {
    month: string;
    count: number;
}

export interface SpecialtyStatItem {
    name: string;
    count: number;
}

export interface RecentActivityItem {
    action: string;
    entityType?: string;
    description: string;
    timestamp: string;
}

export interface PaymentStats {
    totalPayments: number;
    completedPayments: number;
    successRate: number;
}

export interface AdminDashboardStats {
    totalUsers: number;
    totalDoctors: number;
    totalPatients: number;
    todayAppointments: number;
    monthAppointments: number;
    pendingAppointments: number;
    monthlyAppointmentStats: MonthlyStatItem[];
    specialtyDistribution: SpecialtyStatItem[];
    recentActivities: RecentActivityItem[];
    paymentStats: PaymentStats;
}

export interface AdminUserRequest {
    email: string;
    password?: string;
    fullName: string;
    phone?: string;
    role: string;
    isActive?: boolean;

    // Doctor specific
    specialtyId?: string;
    licenseNumber?: string;
    experienceYears?: number;
    consultationFee?: number;

    // Patient specific
    dateOfBirth?: string;
    gender?: string;
    address?: string;
}

export interface AdminAppointmentFilters {
    dateFrom?: string;
    dateTo?: string;
    doctorId?: string;
    status?: string;
}

// Reports & Statistics Types
export interface DataPoint {
    label: string;
    value?: number;
    count?: number;
}

export interface CategoryStat {
    category: string;
    count: number;
    value?: number;
}

export interface DoctorPerformance {
    doctorName: string;
    appointmentCount: number;
    totalRevenue: number;
    averageRating: number;
}

export interface ReportResponse {
    totalRevenue: number;
    totalAppointments: number;
    completedAppointments: number;
    totalPatients: number;
    revenueTrend: DataPoint[];
    appointmentTrend: DataPoint[];
    specialtyDistribution: CategoryStat[];
    statusDistribution: CategoryStat[];
    genderDistribution: CategoryStat[];
    ageDistribution: CategoryStat[];
    doctorPerformance: DoctorPerformance[];
    userRegistrationTrend: DataPoint[];
    roleDistribution: CategoryStat[];
}
