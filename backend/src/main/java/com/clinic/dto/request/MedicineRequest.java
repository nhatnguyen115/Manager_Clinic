package com.clinic.dto.request;

import com.clinic.entity.enums.DosageForm;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MedicineRequest {
    @NotBlank(message = "Medicine name is required")
    String name;

    String genericName;
    DosageForm dosageForm;
    String strength;
    String manufacturer;
    String description;
    String sideEffects;
    String contraindications;

    @Builder.Default
    Boolean isPrescription = true;

    @Builder.Default
    Boolean isActive = true;
}
