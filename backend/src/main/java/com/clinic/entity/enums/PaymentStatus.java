package com.clinic.entity.enums;

/**
 * Status of a payment.
 */
public enum PaymentStatus {
    PENDING, // Chờ thanh toán
    PROCESSING, // Đang xử lý
    COMPLETED, // Thành công
    FAILED, // Thất bại
    REFUNDED // Đã hoàn tiền
}
