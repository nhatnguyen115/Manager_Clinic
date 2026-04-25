package com.clinic.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SpecialtyRequest {
    @NotBlank(message = "Specialty name is required")
    String name;
    String description;
    String icon;
    Boolean isActive;
    Integer displayOrder;
}
