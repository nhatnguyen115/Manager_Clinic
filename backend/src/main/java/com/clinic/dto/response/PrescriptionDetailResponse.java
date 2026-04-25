package com.clinic.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PrescriptionDetailResponse {
    Integer id;
    Integer medicineId;
    String medicineName;
    String dosage;
    String frequency;
    String duration;
    String instructions;
    Integer quantity;
    LocalDateTime createdAt;
}
