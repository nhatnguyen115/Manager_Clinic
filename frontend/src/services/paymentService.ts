import apiClient from './apiClient';
import { ApiResponse } from '../types';

export interface PaymentRequest {
    appointmentId: string;
}

export interface PaymentResponse {
    paymentUrl?: string;
    paymentId: string;
    amount: number;
    paymentMethod: string;
    status: string;
    transactionId?: string;
    paidAt?: string;
    appointmentId: string;
    doctorName: string;
    specialtyName: string;
    appointmentDate: string;
}

export interface InvoiceResponse {
    id: string;
    invoiceNumber: string;
    items: string;
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    issuedAt: string;
    // Enriched
    paymentId?: string;
    appointmentId?: string;
    patientName?: string;
    doctorName?: string;
    specialtyName?: string;
    appointmentDate?: string;
    paymentMethod?: string;
    paymentStatus?: string;
}

export const paymentService = {
    createPaymentUrl: async (appointmentId: string): Promise<ApiResponse<PaymentResponse>> => {
        const response = await apiClient.post<ApiResponse<PaymentResponse>>('/payments/create-url', { appointmentId });
        return response.data;
    },


    getPaymentHistory: async (): Promise<ApiResponse<PaymentResponse[]>> => {
        const response = await apiClient.get<ApiResponse<PaymentResponse[]>>('/payments/history');
        return response.data;
    },

    getPaymentDetail: async (id: string): Promise<ApiResponse<PaymentResponse>> => {
        const response = await apiClient.get<ApiResponse<PaymentResponse>>(`/payments/${id}`);
        return response.data;
    },

    getInvoiceByPaymentId: async (paymentId: string): Promise<ApiResponse<InvoiceResponse>> => {
        const response = await apiClient.get<ApiResponse<InvoiceResponse>>(`/invoices/payment/${paymentId}`);
        return response.data;
    },

    getInvoiceById: async (id: string): Promise<ApiResponse<InvoiceResponse>> => {
        const response = await apiClient.get<ApiResponse<InvoiceResponse>>(`/invoices/${id}`);
        return response.data;
    },

    getAllInvoices: async (): Promise<ApiResponse<InvoiceResponse[]>> => {
        const response = await apiClient.get<ApiResponse<InvoiceResponse[]>>('/invoices');
        return response.data;
    },



    markInvoiceAsPaid: async (invoiceId: string, paymentMethod: string = 'CASH'): Promise<ApiResponse<InvoiceResponse>> => {
        const response = await apiClient.patch<ApiResponse<InvoiceResponse>>(`/invoices/${invoiceId}/mark-paid?paymentMethod=${paymentMethod}`);
        return response.data;
    },
};

export default paymentService;
