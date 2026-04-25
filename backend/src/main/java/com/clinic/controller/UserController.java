package com.clinic.controller;

import com.clinic.dto.request.PasswordChangeRequest;
import com.clinic.dto.request.ProfileUpdateRequest;
import com.clinic.dto.response.ApiResponse;
import com.clinic.dto.response.UserResponse;
import com.clinic.security.CustomUserDetails;
import com.clinic.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;

    @PostMapping("/me/avatar")
    public ApiResponse<String> uploadAvatar(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ApiResponse.<String>builder()
                .result(userService.uploadAvatar(userDetails.getId(), file))
                .build();
    }

    @GetMapping("/me")
    public ApiResponse<UserResponse> getMyProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.getMyProfile(userDetails.getId()))
                .build();
    }

    @PutMapping("/me")
    public ApiResponse<UserResponse> updateProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ProfileUpdateRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.updateProfile(userDetails.getId(), request))
                .build();
    }

    @PutMapping("/me/password")
    public ApiResponse<Void> changePassword(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody PasswordChangeRequest request) {
        userService.changePassword(userDetails.getId(), request);
        return ApiResponse.<Void>builder()
                .message("Password changed successfully")
                .build();
    }
}
