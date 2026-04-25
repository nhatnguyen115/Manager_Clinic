package com.clinic.service;

import com.clinic.dto.request.AdminUserRequest;
import com.clinic.dto.response.UserResponse;
import com.clinic.entity.*;
import com.clinic.entity.enums.Gender;
import com.clinic.entity.enums.RoleName;
import com.clinic.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private DoctorRepository doctorRepository;
    @Mock
    private PatientRepository patientRepository;
    @Mock
    private SpecialtyRepository specialtyRepository;
    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AdminService adminService;

    private Role doctorRole;
    private Role patientRole;

    @BeforeEach
    void setUp() {
        doctorRole = Role.builder().name(RoleName.DOCTOR).build();
        patientRole = Role.builder().name(RoleName.PATIENT).build();
    }

    @Test
    void createUser_Doctor_ShouldPopulateDetails() {
        // Arrange
        java.util.UUID specialtyId = java.util.UUID.randomUUID();
        AdminUserRequest request = AdminUserRequest.builder()
                .email("doctor@test.com")
                .fullName("Dr. House")
                .password("password123")
                .role("DOCTOR")
                .specialtyId(specialtyId)
                .licenseNumber("LIC123")
                .experienceYears(10)
                .consultationFee(new BigDecimal("500000"))
                .build();

        Specialty specialty = Specialty.builder().name("Cardiology").build();
        specialty.setId(specialtyId);
        User user = User.builder().email("doctor@test.com").role(doctorRole).build();
        user.setId(java.util.UUID.randomUUID());

        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(roleRepository.findByName(RoleName.DOCTOR)).thenReturn(Optional.of(doctorRole));
        when(passwordEncoder.encode(any())).thenReturn("encoded_pass");
        when(userRepository.save(any())).thenReturn(user);
        when(specialtyRepository.findById(specialtyId)).thenReturn(Optional.of(specialty));

        // Act
        UserResponse response = adminService.createUser(request);

        // Assert
        assertNotNull(response);
        verify(doctorRepository).save(argThat(doctor -> doctor.getLicenseNumber().equals("LIC123") &&
                doctor.getExperienceYears() == 10 &&
                doctor.getConsultationFee().compareTo(new BigDecimal("500000")) == 0 &&
                doctor.getSpecialty().equals(specialty)));
    }

    @Test
    void createUser_Patient_ShouldPopulateDetails() {
        // Arrange
        LocalDate dob = LocalDate.of(1990, 1, 1);
        AdminUserRequest request = AdminUserRequest.builder()
                .email("patient@test.com")
                .fullName("John Doe")
                .password("password123")
                .role("PATIENT")
                .dateOfBirth(dob)
                .gender("MALE")
                .address("123 Street")
                .build();

        User user = User.builder().email("patient@test.com").role(patientRole).build();
        user.setId(java.util.UUID.randomUUID());

        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(roleRepository.findByName(RoleName.PATIENT)).thenReturn(Optional.of(patientRole));
        when(passwordEncoder.encode(any())).thenReturn("encoded_pass");
        when(userRepository.save(any())).thenReturn(user);

        // Act
        UserResponse response = adminService.createUser(request);

        // Assert
        assertNotNull(response);
        verify(patientRepository).save(argThat(patient -> patient.getDateOfBirth().equals(dob) &&
                patient.getGender() == Gender.MALE &&
                patient.getAddress().equals("123 Street")));
    }
}
