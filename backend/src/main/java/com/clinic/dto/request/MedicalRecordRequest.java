package com.clinic.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MedicalRecordRequest {
    @NotNull(message = "Appointment ID is required")
    UUID appointmentId;

    @NotBlank(message = "Diagnosis is required")
    String diagnosis;

    String symptoms;
    String vitalSigns; // JSON string
    String treatment;
    String notes;
    LocalDate followUpDate;

    List<PrescriptionDetailRequest> prescriptionDetails;
}
