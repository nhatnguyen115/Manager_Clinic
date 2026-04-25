package com.clinic.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DoctorRequest {
    @NotBlank(message = "Full name is required")
    String fullName;
    String phoneNumber;
    String bio;
    Integer experienceYears;
    String licenseNumber;
    BigDecimal consultationFee;
    Boolean isAvailable;
    UUID specialtyId;
    UUID userId; // For Admin creation
    List<String> education;
    List<String> certifications;
}
