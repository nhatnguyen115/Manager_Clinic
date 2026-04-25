package com.clinic.controller;

import com.clinic.dto.request.PatientRequest;
import com.clinic.entity.Patient;
import com.clinic.entity.User;
import com.clinic.entity.enums.RoleName;
import com.clinic.repository.PatientRepository;
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

import java.util.Collections;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class PatientControllerIT {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private PatientRepository patientRepository;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private RoleRepository roleRepository;

        @Autowired
        private JwtTokenProvider jwtTokenProvider;

        @Autowired
        private ObjectMapper objectMapper;

        private String adminToken;
        private Patient testPatient;

        @BeforeEach
        void setUp() {
                patientRepository.deleteAll();
                userRepository.deleteAll();

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

                // Create Patient
                var patientRole = roleRepository.findByName(RoleName.PATIENT).get();
                User patientUser = User.builder()
                                .fullName("Patient User")
                                .email("patient@test.com")
                                .passwordHash("hashed")
                                .role(patientRole)
                                .isActive(true)
                                .build();
                userRepository.save(patientUser);
                testPatient = patientRepository.save(Patient.builder().user(patientUser).build());
        }

        @Test
        void getAllPatients_AsAdmin_ShouldSucceed() throws Exception {
                mockMvc.perform(get("/api/patients")
                                .header("Authorization", "Bearer " + adminToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.result").isArray())
                                .andExpect(jsonPath("$.result[0].fullName").value("Patient User"));
        }

        @Test
        void getPatientById_AsAdmin_ShouldSucceed() throws Exception {
                mockMvc.perform(get("/api/patients/" + testPatient.getId())
                                .header("Authorization", "Bearer " + adminToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.result.fullName").value("Patient User"));
        }

        @Test
        void updatePatient_AsAdmin_ShouldSucceed() throws Exception {
                PatientRequest request = PatientRequest.builder()
                                .fullName("Full Name Updated")
                                .phoneNumber("0123444555")
                                .address("New Address")
                                .build();

                mockMvc.perform(put("/api/patients/" + testPatient.getId())
                                .header("Authorization", "Bearer " + adminToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.result.fullName").value("Full Name Updated"))
                                .andExpect(jsonPath("$.result.address").value("New Address"));
        }
}
