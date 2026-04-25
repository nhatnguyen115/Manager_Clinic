package com.clinic.controller;

import com.clinic.dto.request.PasswordChangeRequest;
import com.clinic.dto.request.ProfileUpdateRequest;
import com.clinic.entity.Role;
import com.clinic.entity.User;
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
import org.springframework.web.bind.annotation.*;

import java.util.Collections;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class UserControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private String accessToken;
    private User testUser;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();

        Role role = roleRepository.findByName(RoleName.PATIENT)
                .orElseGet(() -> roleRepository.save(Role.builder().name(RoleName.PATIENT).permissions("[]").build()));

        testUser = User.builder()
                .fullName("Integration Test User")
                .email("it@test.com")
                .passwordHash("hashed")
                .role(role)
                .isActive(true)
                .build();
        userRepository.save(testUser);

        // Generate token
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                com.clinic.security.CustomUserDetails.build(testUser), null,
                Collections.emptyList());
        accessToken = jwtTokenProvider.generateToken(authentication);
    }

    @Test
    void getMyProfile_ShouldReturnUserProfile() throws Exception {
        mockMvc.perform(get("/api/users/me")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.email").value("it@test.com"))
                .andExpect(jsonPath("$.result.fullName").value("Integration Test User"))
                .andExpect(jsonPath("$.code").value(1000));
    }

    @Test
    void updateProfile_ShouldUpdateUserData() throws Exception {
        ProfileUpdateRequest request = ProfileUpdateRequest.builder()
                .fullName("Updated Name")
                .phone("0999888777")
                .build();

        mockMvc.perform(get("/api/users/me") // Check current name first
                .header("Authorization", "Bearer " + accessToken))
                .andExpect(jsonPath("$.result.fullName").value("Integration Test User"));

        mockMvc.perform(put("/api/users/me")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.fullName").value("Updated Name"))
                .andExpect(jsonPath("$.result.phone").value("0999888777"));
    }

    @Test
    void changePassword_WithCorrectCurrentPassword_ShouldSucceed() throws Exception {
        // We need the raw password to test this, let's update test user password in
        // setUp
        // but for now, let's just assume we can update it here
        testUser.setPasswordHash(
                new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().encode("oldPass123"));
        userRepository.save(testUser);

        PasswordChangeRequest request = PasswordChangeRequest.builder()
                .currentPassword("oldPass123")
                .newPassword("newPass123")
                .build();

        mockMvc.perform(put("/api/users/me/password")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password changed successfully"));
    }

    @Test
    void changePassword_WithWrongCurrentPassword_ShouldFail() throws Exception {
        testUser.setPasswordHash(
                new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().encode("oldPass123"));
        userRepository.save(testUser);

        PasswordChangeRequest request = PasswordChangeRequest.builder()
                .currentPassword("wrongPass")
                .newPassword("newPass123")
                .build();

        mockMvc.perform(put("/api/users/me/password")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(request)))
                .andExpect(status().isUnauthorized()); // Based on our UserService implementation throwing
                                                       // UNAUTHENTICATED
    }
}
