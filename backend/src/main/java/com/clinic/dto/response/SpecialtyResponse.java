package com.clinic.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SpecialtyResponse {
    UUID id;
    String name;
    String description;
    String icon;
    Boolean isActive;
    Integer displayOrder;
    Long doctorCount;
}
