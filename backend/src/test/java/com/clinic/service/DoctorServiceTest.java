package com.clinic.service;

import com.clinic.dto.response.DoctorResponse;
import com.clinic.entity.Doctor;
import com.clinic.entity.Specialty;
import com.clinic.entity.User;
import com.clinic.entity.enums.RoleName;
import com.clinic.repository.DoctorRepository;
import com.clinic.repository.SpecialtyRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DoctorServiceTest {

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private SpecialtyRepository specialtyRepository;

    @Mock
    private com.clinic.repository.ReviewRepository reviewRepository;

    @InjectMocks
    private DoctorService doctorService;

    private Doctor doctor;
    private Specialty specialty;
    private UUID doctorId;
    private UUID specialtyId;

    @BeforeEach
    void setUp() {
        doctorId = UUID.randomUUID();
        specialtyId = UUID.randomUUID();

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setFullName("Dr. John Doe");
        user.setRole(com.clinic.entity.Role.builder().name(RoleName.DOCTOR).build());

        specialty = new Specialty();
        specialty.setId(specialtyId);
        specialty.setName("Cardiology");

        doctor = new Doctor();
        doctor.setId(doctorId);
        doctor.setUser(user);
        doctor.setSpecialty(specialty);
    }

    @Test
    void updateDoctorSpecialty_ShouldUpdateSuccessfully() {
        // Arrange
        UUID newSpecialtyId = UUID.randomUUID();
        Specialty newSpecialty = new Specialty();
        newSpecialty.setId(newSpecialtyId);
        newSpecialty.setName("Neurology");

        when(doctorRepository.findById(doctorId)).thenReturn(Optional.of(doctor));
        when(specialtyRepository.findById(newSpecialtyId)).thenReturn(Optional.of(newSpecialty));
        when(doctorRepository.save(any(Doctor.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        DoctorResponse response = doctorService.updateDoctorSpecialty(doctorId, newSpecialtyId);

        // Assert
        assertNotNull(response);
        assertEquals(newSpecialtyId, response.getSpecialtyId());
        assertEquals("Neurology", response.getSpecialtyName());
    }

    @Test
    void updateDoctorSpecialty_WithNull_ShouldRemoveSpecialty() {
        // Arrange
        when(doctorRepository.findById(doctorId)).thenReturn(Optional.of(doctor));
        when(doctorRepository.save(any(Doctor.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        DoctorResponse response = doctorService.updateDoctorSpecialty(doctorId, null);

        // Assert
        assertNotNull(response);
        assertNull(response.getSpecialtyId());
        assertNull(response.getSpecialtyName());
    }

    @Test
    void getDoctorsNoSpecialty_ShouldReturnList() {
        // Arrange
        Doctor doctorNoSpecialty = new Doctor();
        doctorNoSpecialty.setId(UUID.randomUUID());
        User user = new User();
        user.setFullName("Dr. No Spec");
        user.setRole(com.clinic.entity.Role.builder().name(RoleName.DOCTOR).build());
        doctorNoSpecialty.setUser(user);

        when(doctorRepository.findBySpecialtyIsNull()).thenReturn(List.of(doctorNoSpecialty));

        // Act
        List<DoctorResponse> result = doctorService.getDoctorsNoSpecialty();

        // Assert
        assertEquals(1, result.size());
        assertEquals("Dr. No Spec", result.get(0).getFullName());
    }
}
