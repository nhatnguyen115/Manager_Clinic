package com.clinic.controller;

import com.clinic.dto.request.DoctorRequest;
import com.clinic.dto.request.MedicineRequest;
import com.clinic.entity.Role;
import com.clinic.entity.User;
import com.clinic.entity.enums.DosageForm;
import com.clinic.entity.enums.RoleName;
import com.clinic.repository.RoleRepository;
import com.clinic.repository.UserRepository;
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
import java.util.Collections;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AdminControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private ObjectMapper objectMapper;

    private String adminToken;

    @BeforeEach
    void setUp() {
        Role adminRole = roleRepository.findByName(RoleName.ADMIN)
                .orElseGet(() -> roleRepository.save(Role.builder().name(RoleName.ADMIN).permissions("[]").build()));

        User adminUser = User.builder()
                .email("admin@test.com")
                .fullName("Admin User")
                .passwordHash("hashed")
                .role(adminRole)
                .isActive(true)
                .build();
        userRepository.save(adminUser);

        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                com.clinic.security.CustomUserDetails.build(adminUser), null,
                Collections.emptyList());
        adminToken = jwtTokenProvider.generateToken(authentication);
    }

    @Test
    void createMedicine_AsAdmin_ShouldSucceed() throws Exception {
        MedicineRequest request = MedicineRequest.builder()
                .name("Paracetamol")
                .genericName("Acetaminophen")
                .dosageForm(DosageForm.TABLET)
                .strength("500mg")
                .manufacturer("MediCorp")
                .description("Pain reliever")
                .isPrescription(false)
                .build();

        mockMvc.perform(post("/api/medicines")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.name").value("Paracetamol"))
                .andExpect(jsonPath("$.result.genericName").value("Acetaminophen"))
                .andExpect(jsonPath("$.code").value(1000));
    }

    @Test
    void createDoctor_AsAdmin_ShouldSucceed() throws Exception {
        Role doctorRole = roleRepository.findByName(RoleName.DOCTOR)
                .orElseGet(() -> roleRepository.save(Role.builder().name(RoleName.DOCTOR).permissions("[]").build()));

        User doctorUser = User.builder()
                .email("doctor@test.com")
                .fullName("Doctor User")
                .passwordHash("hashed")
                .role(doctorRole)
                .isActive(true)
                .build();
        userRepository.save(doctorUser);

        DoctorRequest request = DoctorRequest.builder()
                .fullName("Dr. Test")
                .userId(doctorUser.getId())
                .bio("Specialist in testing")
                .experienceYears(10)
                .licenseNumber("DOC123")
                .consultationFee(new BigDecimal("100.00"))
                .build();

        mockMvc.perform(post("/api/doctors")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.fullName").value("Doctor User")) // Uses user's full name from DB
                .andExpect(jsonPath("$.result.licenseNumber").value("DOC123"))
                .andExpect(jsonPath("$.code").value(1000));
    }

    @Test
    void createDoctor_AsUnauthorized_ShouldFail() throws Exception {
        Role patientRole = roleRepository.findByName(RoleName.PATIENT)
                .orElseGet(() -> roleRepository.save(Role.builder().name(RoleName.PATIENT).permissions("[]").build()));

        User patientUser = User.builder()
                .email("patient@test.com")
                .fullName("Patient User")
                .passwordHash("hashed")
                .role(patientRole)
                .isActive(true)
                .build();
        userRepository.save(patientUser);

        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                com.clinic.security.CustomUserDetails.build(patientUser), null,
                Collections.emptyList());
        String patientToken = jwtTokenProvider.generateToken(authentication);

        DoctorRequest request = DoctorRequest.builder()
                .fullName("Dr. Unauthorized")
                .userId(UUID.randomUUID())
                .build();

        mockMvc.perform(post("/api/doctors")
                .header("Authorization", "Bearer " + patientToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }
}
