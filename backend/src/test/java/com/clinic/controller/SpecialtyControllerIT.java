package com.clinic.controller;

import com.clinic.dto.request.SpecialtyRequest;
import com.clinic.entity.User;
import com.clinic.entity.enums.RoleName;
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

import java.util.Collections;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class SpecialtyControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private SpecialtyRepository specialtyRepository;

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
        specialtyRepository.deleteAll();
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
    }

    @Test
    void createSpecialty_AsAdmin_ShouldSucceed() throws Exception {
        SpecialtyRequest request = SpecialtyRequest.builder()
                .name("Neurology")
                .description("Brain stuff")
                .icon("brain-icon")
                .isActive(true)
                .displayOrder(1)
                .build();

        mockMvc.perform(post("/api/specialties")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.name").value("Neurology"));
    }

    @Test
    void getAllActiveSpecialties_ShouldSucceed() throws Exception {
        SpecialtyRequest request = SpecialtyRequest.builder().name("Dermatology").isActive(true).build();
        mockMvc.perform(post("/api/specialties")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)));

        mockMvc.perform(get("/api/specialties"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").isArray())
                .andExpect(jsonPath("$.result[0].name").value("Dermatology"));
    }

    @Test
    void createSpecialty_AsPublic_ShouldFail() throws Exception {
        SpecialtyRequest request = SpecialtyRequest.builder().name("Unauthorized").build();

        mockMvc.perform(post("/api/specialties")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }
}
