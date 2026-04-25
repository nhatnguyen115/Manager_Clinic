package com.clinic.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PrescriptionDetailRequest {
    @NotNull(message = "Medicine ID is required")
    Integer medicineId;

    @NotNull(message = "Dosage is required")
    String dosage;

    @NotNull(message = "Frequency is required")
    String frequency;

    String duration;
    String instructions;

    @NotNull(message = "Quantity is required")
    Integer quantity;
}
