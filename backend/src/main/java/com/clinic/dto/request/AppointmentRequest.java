package com.clinic.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AppointmentRequest {
    @NotNull(message = "Doctor ID is required")
    UUID doctorId;

    UUID specialtyId;

    @NotNull(message = "Time slot ID is required")
    Integer timeSlotId;

    @NotNull(message = "Appointment date is required")
    LocalDate appointmentDate;

    String symptoms;
    String notes;
}
