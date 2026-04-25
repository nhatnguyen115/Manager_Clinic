package com.clinic.service;

import com.clinic.entity.Doctor;
import com.clinic.entity.Medicine;
import com.clinic.entity.Specialty;
import com.clinic.entity.User;
import com.clinic.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatFunctionServiceTest {

    @Mock
    private SpecialtyRepository specialtyRepository;
    @Mock
    private DoctorRepository doctorRepository;
    @Mock
    private WorkingScheduleRepository workingScheduleRepository;
    @Mock
    private MedicineRepository medicineRepository;
    @Mock
    private AppointmentRepository appointmentRepository;
    @Mock
    private TimeSlotRepository timeSlotRepository;
    @Mock
    private com.clinic.util.SecurityUtils securityUtils;

    @InjectMocks
    private ChatFunctionService chatFunctionService;

    @Test
    void listSpecialties_ShouldReturnFormattedList() {
        Specialty s = new Specialty();
        s.setId(UUID.randomUUID());
        s.setName("Cardiology");
        s.setDescription("Heart care");
        
        when(specialtyRepository.findByIsActiveTrueOrderByDisplayOrderAsc()).thenReturn(List.of(s));

        List<Map<String, Object>> result = chatFunctionService.listSpecialties();

        assertNotNull(result);
        assertFalse(result.isEmpty());
        assertEquals("Cardiology", result.get(0).get("name"));
    }

    @Test
    void searchDoctors_BySpecialty_ShouldReturnDoctors() {
        UUID specialtyId = UUID.randomUUID();
        Specialty s = new Specialty();
        s.setId(specialtyId);
        s.setName("Cardiology");
        
        User user = new User();
        user.setFullName("Dr. Smith");
        
        Doctor d = new Doctor();
        d.setId(UUID.randomUUID());
        d.setUser(user);
        d.setSpecialty(s);
        d.setConsultationFee(new BigDecimal("500000"));
        d.setAvgRating(new BigDecimal("4.5"));

        when(specialtyRepository.findByName("Cardiology")).thenReturn(Optional.of(s));
        when(doctorRepository.findBySpecialty_IdAndIsAvailableTrue(eq(specialtyId), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(d)));

        List<Map<String, Object>> result = chatFunctionService.searchDoctors("Cardiology", null);

        assertNotNull(result);
        assertFalse(result.isEmpty());
        assertEquals("Dr. Smith", result.get(0).get("fullName"));
    }

    @Test
    void searchMedicines_ShouldReturnFormattedList() {
        Medicine m = new Medicine();
        m.setName("Aspirin");
        m.setGenericName("Acetylsalicylic acid");
        m.setDescription("Pain relief");
        
        when(medicineRepository.searchByName(anyString(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(m)));

        List<Map<String, Object>> result = chatFunctionService.searchMedicines("Aspirin");

        assertNotNull(result);
        assertFalse(result.isEmpty());
        assertEquals("Aspirin", result.get(0).get("name"));
    }

    @Test
    void getClinicInfo_ShouldReturnBasicInfo() {
        Map<String, Object> info = chatFunctionService.getClinicInfo();
        
        assertNotNull(info);
        assertEquals("Phòng khám Đa khoa ClinicPro", info.get("clinicName"));
        assertTrue(info.containsKey("address"));
        assertTrue(info.containsKey("phone"));
    }
}
