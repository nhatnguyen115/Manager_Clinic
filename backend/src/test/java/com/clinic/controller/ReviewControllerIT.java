package com.clinic.controller;

import com.clinic.dto.request.ReviewRequest;
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

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ReviewControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ReviewRepository reviewRepository;

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
    private String doctorToken;
    private Appointment testAppointment;
    private Doctor testDoctor;
    private Patient testPatient;

    @BeforeEach
    void setUp() {
        reviewRepository.deleteAll();
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
                .email("patient@test.com")
                .passwordHash("hashed")
                .role(patientRole)
                .isActive(true)
                .build());
        testPatient = patientRepository.save(Patient.builder().user(patientUser).build());
        var patientPrincipal = com.clinic.security.CustomUserDetails.build(patientUser);
        patientToken = jwtTokenProvider.generateToken(new UsernamePasswordAuthenticationToken(
                patientPrincipal, null, patientPrincipal.getAuthorities()));

        var doctorRole = roleRepository.findByName(RoleName.DOCTOR).get();
        User doctorUser = userRepository.save(User.builder()
                .fullName("Doctor User")
                .email("doctor@test.com")
                .passwordHash("hashed")
                .role(doctorRole)
                .isActive(true)
                .build());
        testDoctor = doctorRepository.save(Doctor.builder().user(doctorUser).build());
        var doctorPrincipal = com.clinic.security.CustomUserDetails.build(doctorUser);
        doctorToken = jwtTokenProvider.generateToken(new UsernamePasswordAuthenticationToken(
                doctorPrincipal, null, doctorPrincipal.getAuthorities()));

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
                .status(AppointmentStatus.COMPLETED)
                .build());
    }

    @Test
    void createReview_ShouldSucceed() throws Exception {
        ReviewRequest request = ReviewRequest.builder()
                .appointmentId(testAppointment.getId())
                .rating(5)
                .comment("Excellent doctor!")
                .isAnonymous(false)
                .build();

        mockMvc.perform(post("/api/reviews")
                .header("Authorization", "Bearer " + patientToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.rating").value(5))
                .andExpect(jsonPath("$.result.patientName").value("Patient User"));
    }

    @Test
    void createReview_Duplicate_ShouldFail() throws Exception {
        reviewRepository.save(Review.builder()
                .appointment(testAppointment)
                .patient(testPatient)
                .doctor(testDoctor)
                .rating(4)
                .build());

        ReviewRequest request = ReviewRequest.builder()
                .appointmentId(testAppointment.getId())
                .rating(5)
                .build();

        mockMvc.perform(post("/api/reviews")
                .header("Authorization", "Bearer " + patientToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(2005));
    }

    @Test
    void getDoctorReviews_ShouldSucceed() throws Exception {
        reviewRepository.save(Review.builder()
                .appointment(testAppointment)
                .patient(testPatient)
                .doctor(testDoctor)
                .rating(5)
                .comment("Great!")
                .isVisible(true)
                .build());

        mockMvc.perform(get("/api/doctors/" + testDoctor.getId() + "/reviews"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").isArray())
                .andExpect(jsonPath("$.result[0].rating").value(5));
    }
}
