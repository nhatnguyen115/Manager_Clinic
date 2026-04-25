package com.clinic.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PatientResponse {
    UUID id;
    String fullName;
    String email;
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
