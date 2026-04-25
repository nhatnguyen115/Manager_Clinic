package com.clinic.controller;

import com.clinic.dto.request.PaymentRequest;
import com.clinic.entity.*;
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
class PaymentControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private TimeSlotRepository timeSlotRepository;

    @Autowired
    private WorkingScheduleRepository workingScheduleRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private ObjectMapper objectMapper;

    private String patientToken;
    private Appointment testAppointment;

    @BeforeEach
    void setUp() {
        appointmentRepository.deleteAll();
        timeSlotRepository.deleteAll();
        workingScheduleRepository.deleteAll();
        doctorRepository.deleteAll();
        patientRepository.deleteAll();
        userRepository.deleteAll();

        // Setup Roles and Users
        var patientRole = roleRepository.findByName(RoleName.PATIENT).get();
        User patientUser = userRepository.save(User.builder()
                .fullName("Patient User")
                .email("patient_pay@test.com")
                .passwordHash("hashed")
                .role(patientRole)
                .isActive(true)
                .build());
        Patient testPatient = patientRepository.save(Patient.builder().user(patientUser).build());
        var patientPrincipal = com.clinic.security.CustomUserDetails.build(patientUser);
        patientToken = jwtTokenProvider.generateToken(new UsernamePasswordAuthenticationToken(
                patientPrincipal, null, patientPrincipal.getAuthorities()));

        var doctorRole = roleRepository.findByName(RoleName.DOCTOR).get();
        User doctorUser = userRepository.save(User.builder()
                .fullName("Doctor User")
                .email("doctor_pay@test.com")
                .passwordHash("hashed")
                .role(doctorRole)
                .isActive(true)
                .build());
        Doctor testDoctor = doctorRepository.save(Doctor.builder()
                .user(doctorUser)
                .consultationFee(new BigDecimal("100000"))
                .build());

        // Setup Schedule and Slot
        WorkingSchedule schedule = workingScheduleRepository.save(WorkingSchedule.builder()
                .doctor(testDoctor)
                .dayOfWeek(1)
                .isAvailable(true)
                .build());
        TimeSlot slot = timeSlotRepository.save(TimeSlot.builder()
                .schedule(schedule)
                .startTime(LocalTime.of(14, 0))
                .endTime(LocalTime.of(14, 30))
                .build());

        // Setup Appointment
        testAppointment = appointmentRepository.save(Appointment.builder()
                .patient(testPatient)
                .doctor(testDoctor)
                .timeSlot(slot)
                .appointmentDate(LocalDate.now())
                .appointmentTime(slot.getStartTime())
                .build());
    }

    @Test
    void createPaymentUrl_ShouldSucceed() throws Exception {
        PaymentRequest request = PaymentRequest.builder()
                .appointmentId(testAppointment.getId())
                .build();

        mockMvc.perform(post("/api/payments/create-url")
                .header("Authorization", "Bearer " + patientToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.paymentUrl").exists())
                .andExpect(jsonPath("$.result.paymentUrl").value(org.hamcrest.Matchers.containsString("vnpayment.vn")));
    }

    @Test
    void callback_WithInvalidHash_ShouldFail() throws Exception {
        mockMvc.perform(get("/api/payments/vnpay-callback")
                .param("vnp_TxnRef", UUID.randomUUID().toString())
                .param("vnp_ResponseCode", "00")
                .param("vnp_SecureHash", "invalid_hash"))
                .andExpect(status().isUnauthorized());
    }
}
