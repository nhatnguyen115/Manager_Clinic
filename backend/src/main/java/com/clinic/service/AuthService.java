package com.clinic.service;

import com.clinic.dto.request.LoginRequest;
import com.clinic.dto.request.RegisterRequest;
import com.clinic.dto.response.AuthResponse;
import com.clinic.dto.request.ForgotPasswordRequest;
import com.clinic.dto.request.ResetPasswordRequest;
import com.clinic.entity.Doctor;
import com.clinic.entity.Patient;
import com.clinic.entity.PasswordResetToken;
import com.clinic.entity.RefreshToken;
import com.clinic.entity.Role;
import com.clinic.entity.User;
import com.clinic.entity.enums.RoleName;
import com.clinic.exception.AppException;
import com.clinic.exception.ErrorCode;
import com.clinic.repository.*;
import com.clinic.security.CustomUserDetails;
import com.clinic.security.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

        private final AuthenticationManager authenticationManager;
        private final UserRepository userRepository;
        private final RoleRepository roleRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtTokenProvider tokenProvider;
        private final RefreshTokenRepository refreshTokenRepository;
        private final PasswordResetTokenRepository passwordResetTokenRepository;
        private final PatientRepository patientRepository;
        private final DoctorRepository doctorRepository;

        @Value("${app.jwt.refresh-expiration}")
        private long refreshExpiration;

        @Value("${app.password-reset.expiration:3600000}") // 1 hour default
        private long passwordResetExpiration;

        @Transactional
        public void register(RegisterRequest request) {
                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new AppException(ErrorCode.EMAIL_ALREADY_REGISTERED);
                }

                Role role = roleRepository.findByName(request.getRoleName())
                                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

                User userToRegister = User.builder()
                                .fullName(request.getFullName())
                                .email(request.getEmail())
                                .passwordHash(passwordEncoder.encode(request.getPassword()))
                                .phone(request.getPhone())
                                .role(role)
                                .isActive(true)
                                .emailVerified(false)
                                .build();

                User user = userRepository.save(userToRegister);

                if (role.getName() == RoleName.PATIENT) {
                        patientRepository.save(Patient.builder().user(user).build());
                } else if (role.getName() == RoleName.DOCTOR) {
                        doctorRepository.save(Doctor.builder().user(user).build());
                }

                log.info("User registered successfully: {}", user.getEmail());
        }

        @Transactional
        public AuthResponse login(LoginRequest request) {
                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

                SecurityContextHolder.getContext().setAuthentication(authentication);

                String accessToken = tokenProvider.generateToken(authentication);
                String refreshToken = tokenProvider.generateRefreshToken(authentication);

                CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
                User user = userRepository.findById(userDetails.getId())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                user.setLastLoginAt(LocalDateTime.now());
                userRepository.save(user);

                saveRefreshToken(user, refreshToken);

                return AuthResponse.builder()
                                .accessToken(accessToken)
                                .refreshToken(refreshToken)
                                .user(AuthResponse.UserResponse.builder()
                                                .id(user.getId())
                                                .email(user.getEmail())
                                                .fullName(user.getFullName())
                                                .role(user.getRole().getName().name())
                                                .build())
                                .build();
        }

        @Transactional
        public String refreshAccessToken(String refreshTokenRequest) {
                return refreshTokenRepository.findByToken(refreshTokenRequest)
                                .filter(RefreshToken::isValid)
                                .map(refreshToken -> {
                                        User user = refreshToken.getUser();
                                        // In a real app, you might want a simpler way to generate token without full
                                        // Authentication object if just refreshing
                                        // But here we'll use a mocked authentication for simplicity or refactor
                                        // tokenProvider
                                        return tokenProvider.generateToken(new UsernamePasswordAuthenticationToken(
                                                        CustomUserDetails.build(user), null,
                                                        CustomUserDetails.build(user).getAuthorities()));
                                })
                                .orElseThrow(() -> new RuntimeException("Invalid or expired refresh token"));
        }

        @Transactional
        public void logout(UUID userId) {
                refreshTokenRepository.revokeAllByUserId(userId, LocalDateTime.now());
        }

        @Transactional
        public void forgotPassword(ForgotPasswordRequest request) {
                User user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new RuntimeException("Email not found"));

                // Delete old tokens for this user
                passwordResetTokenRepository.deleteByUser(user);

                String token = UUID.randomUUID().toString();
                PasswordResetToken resetToken = PasswordResetToken.builder()
                                .user(user)
                                .token(token)
                                .expiryDate(LocalDateTime.now().plusNanos(passwordResetExpiration * 1000000))
                                .build();

                passwordResetTokenRepository.save(resetToken);

                // TODO: Send email
                log.info("PASSWORD RESET TOKEN FOR {}: {}", user.getEmail(), token);
                log.warn("Link: http://localhost:5173/reset-password?token={}", token);
        }

        @Transactional
        public void resetPassword(ResetPasswordRequest request) {
                PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                                .orElseThrow(() -> new RuntimeException("Invalid token"));

                if (resetToken.isExpired()) {
                        passwordResetTokenRepository.delete(resetToken);
                        throw new RuntimeException("Token expired");
                }

                User user = resetToken.getUser();
                user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
                userRepository.save(user);

                passwordResetTokenRepository.delete(resetToken);
                log.info("Password reset successfully for user: {}", user.getEmail());
        }

        private void saveRefreshToken(User user, String token) {
                RefreshToken refreshToken = RefreshToken.builder()
                                .user(user)
                                .token(token)
                                .expiresAt(LocalDateTime.now().plusNanos(refreshExpiration * 1000000))
                                .build();
                refreshTokenRepository.save(refreshToken);
        }
}
