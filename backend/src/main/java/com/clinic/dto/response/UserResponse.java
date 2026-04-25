package com.clinic.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {
    UUID id;
    String email;
    String fullName;
    String phone;
    String avatarUrl;
    String role;

    @JsonProperty("isActive")
    boolean isActive;

    UUID doctorId;
    UUID patientId;

    // Doctor specific
    String bio;
    Integer experienceYears;
    String licenseNumber;
    java.math.BigDecimal consultationFee;
    java.util.List<String> education;
    java.util.List<String> certifications;
    String specialtyName;
    UUID specialtyId;

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
