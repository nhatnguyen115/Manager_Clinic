package com.clinic.service;

import com.clinic.dto.request.ProfileUpdateRequest;
import com.clinic.dto.response.UserResponse;
import com.clinic.entity.Doctor;
import com.clinic.entity.Patient;
import com.clinic.entity.Role;
import com.clinic.entity.User;
import com.clinic.entity.enums.RoleName;
import com.clinic.repository.DoctorRepository;
import com.clinic.repository.PatientRepository;
import com.clinic.repository.UserRepository;
import com.clinic.repository.SpecialtyRepository;
import com.clinic.entity.Specialty;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private DoctorRepository doctorRepository;
    @Mock
    private PatientRepository patientRepository;
    @Mock
    private SpecialtyRepository specialtyRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private FileService fileService;

    @InjectMocks
    private UserService userService;

    private User user;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        user = User.builder()
                .email("test@test.com")
                .fullName("Old Name")
                .isActive(true)
                .build();
        user.setId(userId);
    }

    @Test
    void updateProfile_DoctorSuccess() {
        Role doctorRole = Role.builder().name(RoleName.DOCTOR).build();
        user.setRole(doctorRole);

        Doctor doctor = Doctor.builder()
                .user(user)
                .build();
        doctor.setId(UUID.randomUUID());

        ProfileUpdateRequest request = new ProfileUpdateRequest();
        request.setFullName("New Doctor Name");
        request.setBio("New Bio");
        request.setExperienceYears(10);
        request.setLicenseNumber("LIC123");
        request.setConsultationFee(new BigDecimal("500000"));
        request.setEducation(java.util.List.of("Uni A"));
        request.setCertifications(java.util.List.of("Cert B"));
        UUID specialtyId = UUID.randomUUID();
        request.setSpecialtyId(specialtyId);
        request.setDateOfBirth(LocalDate.of(1980, 5, 15));
        request.setGender("MALE");
        request.setAddress("Street X");
        request.setCity("City Y");

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(doctorRepository.findByUserId(userId)).thenReturn(Optional.of(doctor));
        when(userRepository.save(any())).thenReturn(user);
        when(specialtyRepository.findById(specialtyId)).thenReturn(Optional.of(new Specialty()));

        UserResponse response = userService.updateProfile(userId, request);

        assertEquals("New Doctor Name", user.getFullName());
        assertEquals("New Bio", doctor.getBio());
        assertEquals(10, doctor.getExperienceYears());
        assertEquals("LIC123", doctor.getLicenseNumber());
        assertEquals(request.getConsultationFee(), doctor.getConsultationFee());
        assertEquals(request.getEducation(), doctor.getEducation());
        assertEquals(request.getCertifications(), doctor.getCertifications());
        assertEquals(request.getDateOfBirth(), doctor.getDateOfBirth());
        assertEquals(com.clinic.entity.enums.Gender.MALE, doctor.getGender());
        assertEquals("Street X", doctor.getAddress());
        assertEquals("City Y", doctor.getCity());
        assertNotNull(doctor.getSpecialty());
        verify(doctorRepository, times(1)).save(doctor);
    }

    @Test
    void updateProfile_PatientSuccess() {
        Role patientRole = Role.builder().name(RoleName.PATIENT).build();
        user.setRole(patientRole);

        Patient patient = Patient.builder()
                .user(user)
                .build();
        patient.setId(UUID.randomUUID());

        ProfileUpdateRequest request = new ProfileUpdateRequest();
        request.setFullName("New Patient Name");
        request.setDateOfBirth(LocalDate.of(1990, 1, 1));
        request.setGender("MALE");
        request.setAddress("123 Street");
        request.setCity("Hanoi");
        request.setBloodType("O+");
        request.setAllergies(java.util.List.of("Nut"));
        request.setChronicDiseases(java.util.List.of("None"));
        request.setEmergencyContactName("Bob");
        request.setEmergencyContactPhone("098");
        request.setInsuranceNumber("INS789");

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(patientRepository.findByUserId(userId)).thenReturn(Optional.of(patient));
        when(userRepository.save(any())).thenReturn(user);

        UserResponse response = userService.updateProfile(userId, request);

        assertEquals("New Patient Name", user.getFullName());
        assertEquals(LocalDate.of(1990, 1, 1), patient.getDateOfBirth());
        assertEquals(com.clinic.entity.enums.Gender.MALE, patient.getGender());
        assertEquals("123 Street", patient.getAddress());
        assertEquals("Hanoi", patient.getCity());
        assertEquals("O+", patient.getBloodType());
        assertEquals(request.getAllergies(), patient.getAllergies());
        assertEquals(request.getChronicDiseases(), patient.getChronicDiseases());
        assertEquals("Bob", patient.getEmergencyContactName());
        assertEquals("098", patient.getEmergencyContactPhone());
        assertEquals("INS789", patient.getInsuranceNumber());
        verify(patientRepository, times(1)).save(patient);
    }
}
