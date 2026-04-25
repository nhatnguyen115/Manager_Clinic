package com.clinic.dto.response;

import com.clinic.entity.enums.DosageForm;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MedicineResponse {
    Integer id;
    String name;
    String genericName;
    DosageForm dosageForm;
    String strength;
    String manufacturer;
    String description;
    String sideEffects;
    String contraindications;
    Boolean isPrescription;
    Boolean isActive;
}
