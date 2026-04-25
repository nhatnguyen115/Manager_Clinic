package com.clinic.controller;

import com.clinic.dto.request.AppointmentCancelRequest;
import com.clinic.dto.request.AppointmentRequest;
import com.clinic.dto.request.AppointmentStatusRequest;
import com.clinic.entity.*;
import com.clinic.entity.enums.AppointmentStatus;
import com.clinic.entity.enums.RoleName;
import com.clinic.repository.*;
import com.clinic.security.jwt.JwtTokenProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AppointmentControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private SpecialtyRepository specialtyRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkingScheduleRepository workingScheduleRepository;

    @Autowired
    private TimeSlotRepository timeSlotRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private ObjectMapper objectMapper;

    private String patientToken;
    private String doctorToken;
    private String adminToken;

    private Patient testPatient;
    private Doctor testDoctor;
    private TimeSlot testTimeSlot;
    private Specialty testSpecialty;

    @BeforeEach
    void setUp() {
        appointmentRepository.deleteAll();
        timeSlotRepository.deleteAll();
        workingScheduleRepository.deleteAll();
        doctorRepository.deleteAll();
        patientRepository.deleteAll();
        userRepository.deleteAll();
        specialtyRepository.deleteAll();

        testSpecialty = specialtyRepository.save(Specialty.builder().name("General").build());

        // Create Patient
        var patientRole = roleRepository.findByName(RoleName.PATIENT).get();
        User patientUser = userRepository.save(User.builder()
                .fullName("Patient User")
                .email("patient@test.com")
                .passwordHash("hashed")
                .role(patientRole)
                .isActive(true)
                .build());
        testPatient = patientRepository.save(Patient.builder().user(patientUser).build());
        var patientPrincipal = com.clinic.security.CustomUserDetails.build(patientUser);
        patientToken = jwtTokenProvider.generateToken(new UsernamePasswordAuthenticationToken(
                patientPrincipal, null, patientPrincipal.getAuthorities()));

        // Create Doctor
        var doctorRole = roleRepository.findByName(RoleName.DOCTOR).get();
        User doctorUser = userRepository.save(User.builder()
                .fullName("Doctor User")
                .email("doctor@test.com")
                .passwordHash("hashed")
                .role(doctorRole)
                .isActive(true)
                .build());
        testDoctor = doctorRepository.save(Doctor.builder()
                .user(doctorUser)
                .specialty(testSpecialty)
                .isAvailable(true)
                .consultationFee(new BigDecimal("500000"))
                .build());
        var doctorPrincipal = com.clinic.security.CustomUserDetails.build(doctorUser);
        doctorToken = jwtTokenProvider.generateToken(new UsernamePasswordAuthenticationToken(
                doctorPrincipal, null, doctorPrincipal.getAuthorities()));

        // Create Admin
        var adminRole = roleRepository.findByName(RoleName.ADMIN).get();
        User adminUser = userRepository.save(User.builder()
                .fullName("Admin User")
                .email("admin@test.com")
                .passwordHash("hashed")
                .role(adminRole)
                .isActive(true)
                .build());
        var adminPrincipal = com.clinic.security.CustomUserDetails.build(adminUser);
        adminToken = jwtTokenProvider.generateToken(new UsernamePasswordAuthenticationToken(
                adminPrincipal, null, adminPrincipal.getAuthorities()));

        // Create Schedule and Slot
        WorkingSchedule schedule = workingScheduleRepository.save(WorkingSchedule.builder()
                .doctor(testDoctor)
                .dayOfWeek(1)
                .isAvailable(true)
                .build());
        testTimeSlot = timeSlotRepository.save(TimeSlot.builder()
                .schedule(schedule)
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(9, 30))
                .isAvailable(true)
                .maxPatients(1)
                .build());
    }

    @Test
    void createAppointment_ShouldSucceed() throws Exception {
        AppointmentRequest request = AppointmentRequest.builder()
                .doctorId(testDoctor.getId())
                .specialtyId(testSpecialty.getId())
                .timeSlotId(testTimeSlot.getId())
                .appointmentDate(LocalDate.now().plusDays(1))
                .symptoms("Cough")
                .build();

        mockMvc.perform(post("/api/appointments")
                .header("Authorization", "Bearer " + patientToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.status").value("PENDING"))
                .andExpect(jsonPath("$.result.patientName").value("Patient User"));
    }

    @Test
    void updateStatus_AsDoctor_ShouldSucceed() throws Exception {
        // Create an appointment first
        Appointment appointment = appointmentRepository.save(Appointment.builder()
                .patient(testPatient)
                .doctor(testDoctor)
                .timeSlot(testTimeSlot)
                .appointmentDate(LocalDate.now())
                .appointmentTime(testTimeSlot.getStartTime())
                .status(AppointmentStatus.PENDING)
                .build());

        AppointmentStatusRequest request = AppointmentStatusRequest.builder()
                .status(AppointmentStatus.CONFIRMED)
                .build();

        mockMvc.perform(put("/api/appointments/" + appointment.getId() + "/status")
                .header("Authorization", "Bearer " + doctorToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.status").value("CONFIRMED"));
    }

    @Test
    void cancelAppointment_AsPatient_ShouldSucceed() throws Exception {
        Appointment appointment = appointmentRepository.save(Appointment.builder()
                .patient(testPatient)
                .doctor(testDoctor)
                .timeSlot(testTimeSlot)
                .appointmentDate(LocalDate.now())
                .appointmentTime(testTimeSlot.getStartTime())
                .status(AppointmentStatus.PENDING)
                .build());

        AppointmentCancelRequest request = AppointmentCancelRequest.builder()
                .reason("Busy")
                .build();

        mockMvc.perform(put("/api/appointments/" + appointment.getId() + "/cancel")
                .header("Authorization", "Bearer " + patientToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.status").value("CANCELLED"));
    }

    @Test
    void getMyAppointments_ShouldSucceed() throws Exception {
        appointmentRepository.save(Appointment.builder()
                .patient(testPatient)
                .doctor(testDoctor)
                .timeSlot(testTimeSlot)
                .appointmentDate(LocalDate.now())
                .appointmentTime(testTimeSlot.getStartTime())
                .status(AppointmentStatus.PENDING)
                .build());

        mockMvc.perform(get("/api/appointments/me")
                .header("Authorization", "Bearer " + patientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").isArray())
                .andExpect(jsonPath("$.result.length()").value(1));
    }
}
