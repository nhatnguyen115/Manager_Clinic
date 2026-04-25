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
        private final AuditLogService auditLogService;
        private final EmailService emailService;

        @Value("${app.jwt.refresh-expiration}")
        private long refreshExpiration;

        @Value("${app.password-reset.expiration:3600000}") // 1 hour default
        private long passwordResetExpiration;

        @Transactional
        public void register(RegisterRequest request) {
                String email = request.getEmail().trim().toLowerCase();
                if (userRepository.existsByEmail(email)) {
                        throw new AppException(ErrorCode.EMAIL_ALREADY_REGISTERED);
                }

                Role role = roleRepository.findByName(request.getRoleName())
                                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

                User userToRegister = User.builder()
                                .fullName(request.getFullName())
                                .email(email)
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

                auditLogService.log(user.getId(), "REGISTER", "USER", user.getId().toString());
                log.info("User registered successfully: {}", user.getEmail());

                // Send Welcome Email
                java.util.Map<String, Object> variables = new java.util.HashMap<>();
                variables.put("name", user.getFullName());
                emailService.sendHtmlEmail(user.getEmail(), "Chào mừng bạn đến với ClinicPro", "welcome", variables);
        }

        @Transactional
        public AuthResponse login(LoginRequest request) {
                String email = request.getEmail().trim().toLowerCase();
                log.info("DEBUG: Attempting login for normalized email: '{}'", email);

                userRepository.findByEmail(email).ifPresentOrElse(
                                u -> log.info("DEBUG: Found user in DB. Email: '{}', IsActive: {}, Role: {}",
                                                u.getEmail(), u.getIsActive(),
                                                u.getRole() != null ? u.getRole().getName() : "NULL"),
                                () -> log.warn("DEBUG: User NOT found in DB for email: '{}'", email));

                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(email, request.getPassword()));

                SecurityContextHolder.getContext().setAuthentication(authentication);

                String accessToken = tokenProvider.generateToken(authentication);
                String refreshToken = tokenProvider.generateRefreshToken(authentication);

                CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
                User user = userRepository.findById(userDetails.getId())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                user.setLastLoginAt(LocalDateTime.now());
                userRepository.save(user);

                auditLogService.log(user.getId(), "LOGIN", "USER", user.getId().toString());

                saveRefreshToken(user, refreshToken);

                UUID doctorId = null;
                UUID patientId = null;

                if (user.getRole() != null && user.getRole().getName() == RoleName.DOCTOR) {
                        doctorId = doctorRepository.findByUserId(user.getId())
                                        .map(Doctor::getId)
                                        .orElse(null);
                } else if (user.getRole().getName() == RoleName.PATIENT) {
                        patientId = patientRepository.findByUserId(user.getId())
                                        .map(Patient::getId)
                                        .orElse(null);
                }

                return AuthResponse.builder()
                                .accessToken(accessToken)
                                .refreshToken(refreshToken)
                                .user(AuthResponse.UserResponse.builder()
                                                .id(user.getId())
                                                .email(user.getEmail())
                                                .fullName(user.getFullName())
                                                .role(user.getRole() != null ? user.getRole().getName().name() : null)
                                                .doctorId(doctorId)
                                                .patientId(patientId)
                                                .build())
                                .build();
        }

        @Transactional
        public String refreshAccessToken(String refreshTokenRequest) {
                return refreshTokenRepository.findByToken(refreshTokenRequest)
                                .filter(RefreshToken::isValid)
                                .map(refreshToken -> {
                                        User user = refreshToken.getUser();

                                        // Explicitly load the user with role to avoid lazy loading issues
                                        User freshUser = userRepository.findById(user.getId())
                                                        .orElseThrow(() -> new AppException(
                                                                        ErrorCode.USER_NOT_EXISTED));

                                        CustomUserDetails userDetails = CustomUserDetails.build(freshUser);
                                        log.info("[Auth-Refresh] Refreshing token for user: {}, authorities: {}",
                                                        freshUser.getEmail(), userDetails.getAuthorities());

                                        return tokenProvider.generateToken(new UsernamePasswordAuthenticationToken(
                                                        userDetails, null, userDetails.getAuthorities()));
                                })
                                .orElseThrow(() -> new RuntimeException("Invalid or expired refresh token"));
        }

        @Transactional
        public void logout(UUID userId) {
                refreshTokenRepository.revokeAllByUserId(userId, LocalDateTime.now());
        }

        @Transactional
        public void forgotPassword(ForgotPasswordRequest request) {
                String email = request.getEmail().trim().toLowerCase();
                User user = userRepository.findByEmail(email)
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

                // Send email
                String resetUrl = "http://localhost:5173/reset-password?token=" + token;
                java.util.Map<String, Object> variables = new java.util.HashMap<>();
                variables.put("name", user.getFullName());
                variables.put("resetUrl", resetUrl);

                emailService.sendHtmlEmail(user.getEmail(), "Đặt lại mật khẩu - ClinicPro", "password-reset",
                                variables);

                log.info("PASSWORD RESET TOKEN FOR {}: {}", user.getEmail(), token);
                log.warn("Link: {}", resetUrl);
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
