package com.clinic.controller;

import com.clinic.dto.request.DoctorRequest;
import com.clinic.entity.Doctor;
import com.clinic.entity.Specialty;
import com.clinic.entity.User;
import com.clinic.entity.enums.RoleName;
import com.clinic.repository.DoctorRepository;
import com.clinic.repository.RoleRepository;
import com.clinic.repository.SpecialtyRepository;
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
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class DoctorControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private SpecialtyRepository specialtyRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private ObjectMapper objectMapper;

    private String adminToken;
    private String doctorToken;
    private Doctor testDoctor;
    private Specialty testSpecialty;

    @BeforeEach
    void setUp() {
        doctorRepository.deleteAll();
        userRepository.deleteAll();
        specialtyRepository.deleteAll();

        // Create Specialty
        testSpecialty = specialtyRepository.save(Specialty.builder()
                .name("Cardiology")
                .description("Heart specialists")
                .build());

        // Create Admin
        var adminRole = roleRepository.findByName(RoleName.ADMIN).get();
        User admin = User.builder()
                .fullName("Admin User")
                .email("admin@test.com")
                .passwordHash("hashed")
                .role(adminRole)
                .isActive(true)
                .build();
        userRepository.save(admin);
        var adminPrincipal = com.clinic.security.CustomUserDetails.build(admin);
        adminToken = jwtTokenProvider.generateToken(new UsernamePasswordAuthenticationToken(
                adminPrincipal, null, adminPrincipal.getAuthorities()));

        // Create Doctor
        var doctorRole = roleRepository.findByName(RoleName.DOCTOR).get();
        User doctorUser = User.builder()
                .fullName("Doctor User")
                .email("doctor@test.com")
                .passwordHash("hashed")
                .role(doctorRole)
                .isActive(true)
                .build();
        userRepository.save(doctorUser);

        testDoctor = doctorRepository.save(Doctor.builder()
                .user(doctorUser)
                .specialty(testSpecialty)
                .isAvailable(true)
                .consultationFee(new BigDecimal("500000"))
                .build());

        var doctorPrincipal = com.clinic.security.CustomUserDetails.build(doctorUser);
        doctorToken = jwtTokenProvider.generateToken(new UsernamePasswordAuthenticationToken(
                doctorPrincipal, null, doctorPrincipal.getAuthorities()));
    }

    @Test
    void getAllDoctors_ShouldSucceed() throws Exception {
        mockMvc.perform(get("/api/doctors"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").isArray())
                .andExpect(jsonPath("$.result[0].fullName").value("Doctor User"));
    }

    @Test
    void getDoctorById_ShouldSucceed() throws Exception {
        mockMvc.perform(get("/api/doctors/" + testDoctor.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.fullName").value("Doctor User"))
                .andExpect(jsonPath("$.result.specialtyName").value("Cardiology"));
    }

    @Test
    void updateDoctor_AsAdmin_ShouldSucceed() throws Exception {
        DoctorRequest request = DoctorRequest.builder()
                .fullName("Doctor Updated By Admin")
                .bio("New Bio")
                .consultationFee(new BigDecimal("600000"))
                .isAvailable(false)
                .specialtyId(testSpecialty.getId())
                .build();

        mockMvc.perform(put("/api/doctors/" + testDoctor.getId())
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.fullName").value("Doctor Updated By Admin"))
                .andExpect(jsonPath("$.result.bio").value("New Bio"))
                .andExpect(status().isOk());
    }

    @Test
    void updateDoctor_AsOwner_ShouldSucceed() throws Exception {
        DoctorRequest request = DoctorRequest.builder()
                .fullName("Doctor Self Updated")
                .bio("My Own Bio")
                .consultationFee(new BigDecimal("550000"))
                .isAvailable(true)
                .specialtyId(testSpecialty.getId())
                .build();

        mockMvc.perform(put("/api/doctors/" + testDoctor.getId())
                .header("Authorization", "Bearer " + doctorToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.fullName").value("Doctor Self Updated"));
    }

    @Test
    void updateDoctor_AsOtherDoctor_ShouldFail() throws Exception {
        // Create another doctor
        var doctorRole = roleRepository.findByName(RoleName.DOCTOR).get();
        User otherDoctorUser = User.builder()
                .fullName("Other Doctor")
                .email("other_doctor@test.com")
                .passwordHash("hashed")
                .role(doctorRole)
                .isActive(true)
                .build();
        userRepository.save(otherDoctorUser);
        var otherDoctorPrincipal = com.clinic.security.CustomUserDetails.build(otherDoctorUser);
        String otherDoctorToken = jwtTokenProvider.generateToken(new UsernamePasswordAuthenticationToken(
                otherDoctorPrincipal, null, otherDoctorPrincipal.getAuthorities()));

        DoctorRequest request = DoctorRequest.builder()
                .fullName("Hacker Doctor")
                .build();

        mockMvc.perform(put("/api/doctors/" + testDoctor.getId())
                .header("Authorization", "Bearer " + otherDoctorToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }
}
