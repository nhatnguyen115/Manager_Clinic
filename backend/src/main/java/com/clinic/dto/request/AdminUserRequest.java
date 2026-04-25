package com.clinic.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminUserRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    String email;

    @Size(min = 6, message = "Password must be at least 6 characters")
    String password; // Required only for create, null for update

    @NotBlank(message = "Full name is required")
    String fullName;

    String phone;

    @NotBlank(message = "Role is required")
    String role; // "PATIENT", "DOCTOR", "ADMIN"

    Boolean isActive;

    // Doctor specific fields
    UUID specialtyId;
    String licenseNumber;
    Integer experienceYears;
    java.math.BigDecimal consultationFee;

    // Patient specific fields
    java.time.LocalDate dateOfBirth;
    String gender; // "MALE", "FEMALE", "OTHER"
    String address;
}
