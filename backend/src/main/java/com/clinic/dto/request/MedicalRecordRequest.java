package com.clinic.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
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
    java.util.Map<String, Object> vitalSigns; // JSON object
    String treatment;
    String notes;
    LocalDate followUpDate;

    @NotNull(message = "Actual fee is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Actual fee must be greater than 0")
    BigDecimal actualFee;

    @jakarta.validation.Valid
    List<PrescriptionDetailRequest> prescriptionDetails;
}
