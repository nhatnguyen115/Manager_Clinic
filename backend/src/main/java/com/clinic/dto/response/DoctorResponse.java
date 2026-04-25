package com.clinic.dto.response;

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
public class DoctorResponse {
    UUID id;
    String fullName;
    String email;
    String phoneNumber;
    String avatarUrl;
    String bio;
    Integer experienceYears;
    String licenseNumber;
    BigDecimal consultationFee;
    Boolean isAvailable;
    String specialtyName;
    UUID specialtyId;
    BigDecimal avgRating;
    Integer totalReviews;
    List<String> education;
    List<String> certifications;
}
