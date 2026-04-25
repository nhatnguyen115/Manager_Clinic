package com.clinic.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProfileUpdateRequest {
    @NotBlank(message = "Full name is required")
    String fullName;
    String phone;
    String avatarUrl;

    // Doctor specific
    String bio;
    Integer experienceYears;
    String licenseNumber;
    java.math.BigDecimal consultationFee;
    java.util.List<String> education;
    java.util.List<String> certifications;
    java.util.UUID specialtyId;

    // Patient specific
    java.time.LocalDate dateOfBirth;
    String gender;
    String address;
    String city;
    String bloodType;
    java.util.List<String> allergies;
    java.util.List<String> chronicDiseases;
    String emergencyContactName;
    String emergencyContactPhone;
    String insuranceNumber;
}
