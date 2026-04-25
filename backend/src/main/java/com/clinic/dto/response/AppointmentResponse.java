package com.clinic.dto.response;

import com.clinic.entity.enums.AppointmentStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AppointmentResponse {
    UUID id;
    UUID patientId;
    String patientName;
    UUID doctorId;
    String doctorName;
    UUID specialtyId;
    String specialtyName;
    Integer timeSlotId;
    LocalDate appointmentDate;
    LocalTime appointmentTime;
    AppointmentStatus status;
    String symptoms;
    String notes;
    UUID cancelledBy;
    String cancelledReason;
    LocalDateTime confirmedAt;
    LocalDateTime completedAt;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
