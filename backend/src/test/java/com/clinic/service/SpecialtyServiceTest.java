package com.clinic.service;

import com.clinic.dto.response.SpecialtyResponse;
import com.clinic.entity.Specialty;
import com.clinic.repository.DoctorRepository;
import com.clinic.repository.SpecialtyRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SpecialtyServiceTest {

    @Mock
    private SpecialtyRepository specialtyRepository;

    @Mock
    private DoctorRepository doctorRepository;

    @InjectMocks
    private SpecialtyService specialtyService;

    private Specialty specialty;
    private UUID specialtyId;

    @BeforeEach
    void setUp() {
        specialtyId = UUID.randomUUID();
        specialty = new Specialty();
        specialty.setId(specialtyId);
        specialty.setName("Cardiology");
        specialty.setDescription("Heart care");
    }

    @Test
    void mapToResponse_ShouldIncludeDoctorCount() {
        // Arrange
        long expectedDoctorCount = 5L;
        when(doctorRepository.countBySpecialtyId(specialtyId)).thenReturn(expectedDoctorCount);

        // Act
        // We call a public method that uses mapToResponse internally,
        // e.g., getById (if it exists) or we can test mapToResponse if it was public.
        // Since it's private, we test through a public method.
        when(specialtyRepository.findById(specialtyId)).thenReturn(Optional.of(specialty));

        SpecialtyResponse response = specialtyService.getSpecialtyById(specialtyId);

        // Assert
        assertNotNull(response);
        assertEquals(specialtyId, response.getId());
        assertEquals("Cardiology", response.getName());
        assertEquals(expectedDoctorCount, response.getDoctorCount());
    }
}
