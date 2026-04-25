package com.clinic.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PatientRequest {
    @NotBlank(message = "Full name is required")
    String fullName;
    LocalDate dateOfBirth;
    String gender;
    String phoneNumber;
    String address;
    String city;
    String bloodType;
    java.util.List<String> allergies;
    java.util.List<String> chronicDiseases;
    String emergencyContactName;
    String emergencyContactPhone;
    String insuranceNumber;
}
