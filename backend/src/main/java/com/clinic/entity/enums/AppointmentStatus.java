package com.clinic.entity.enums;

/**
 * Status of an appointment.
 */
public enum AppointmentStatus {
    PENDING, // Chờ xác nhận
    CONFIRMED, // Đã xác nhận
    COMPLETED, // Đã khám xong
    CANCELLED, // Đã hủy
    NO_SHOW // Không đến
}
