package com.clinic.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MedicalRecordResponse {
    UUID id;
    UUID appointmentId;
    UUID patientId;
    String patientName;
    UUID doctorId;
    String doctorName;
    String diagnosis;
    String symptoms;
    java.util.Map<String, Object> vitalSigns;
    String treatment;
    String notes;
    LocalDate followUpDate;
    BigDecimal actualFee;
    List<String> attachments;

    PrescriptionResponse prescription;

    LocalDateTime createdAt;
    LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class PrescriptionResponse {
        UUID id;
        String prescriptionNumber;
        String notes;
        LocalDate validUntil;
        List<PrescriptionDetailResponse> details;
        LocalDateTime createdAt;
    }
}
