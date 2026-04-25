package com.clinic.controller;

import com.clinic.dto.request.ForgotPasswordRequest;
import com.clinic.dto.request.LoginRequest;
import com.clinic.dto.request.RegisterRequest;
import com.clinic.dto.request.ResetPasswordRequest;
import com.clinic.dto.response.ApiResponse;
import com.clinic.dto.response.AuthResponse;
import com.clinic.security.CustomUserDetails;
import com.clinic.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        authService.register(registerRequest);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .message("User registered successfully")
                .build());
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(ApiResponse.<AuthResponse>builder()
                .result(authService.login(loginRequest))
                .build());
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<Map<String, String>>> refreshToken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        String accessToken = authService.refreshAccessToken(refreshToken);
        return ResponseEntity.ok(ApiResponse.<Map<String, String>>builder()
                .result(Map.of("accessToken", accessToken))
                .build());
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails != null) {
            authService.logout(userDetails.getId());
        }
        return ResponseEntity.ok(Map.of("message", "User logged out successfully"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity
                .ok(Map.of("message", "If an account exists with that email, a password reset link has been sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", "Password has been reset successfully."));
    }
}
