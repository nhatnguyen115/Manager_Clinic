package com.clinic.controller;

import com.clinic.dto.request.SpecialtyRequest;
import com.clinic.dto.response.ApiResponse;
import com.clinic.dto.response.SpecialtyResponse;
import com.clinic.service.SpecialtyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/specialties")
@RequiredArgsConstructor
public class SpecialtyController {

    private final SpecialtyService specialtyService;

    @GetMapping
    public ApiResponse<List<SpecialtyResponse>> getAllActiveSpecialties() {
        return ApiResponse.<List<SpecialtyResponse>>builder()
                .result(specialtyService.getAllActiveSpecialties())
                .build();
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<SpecialtyResponse>> getAllSpecialties() {
        return ApiResponse.<List<SpecialtyResponse>>builder()
                .result(specialtyService.getAllSpecialties())
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<SpecialtyResponse> getSpecialtyById(@PathVariable UUID id) {
        return ApiResponse.<SpecialtyResponse>builder()
                .result(specialtyService.getSpecialtyById(id))
                .build();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<SpecialtyResponse> createSpecialty(@Valid @RequestBody SpecialtyRequest request) {
        return ApiResponse.<SpecialtyResponse>builder()
                .result(specialtyService.createSpecialty(request))
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<SpecialtyResponse> updateSpecialty(@PathVariable UUID id,
            @Valid @RequestBody SpecialtyRequest request) {
        return ApiResponse.<SpecialtyResponse>builder()
                .result(specialtyService.updateSpecialty(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> deleteSpecialty(@PathVariable UUID id) {
        specialtyService.deleteSpecialty(id);
        return ApiResponse.<Void>builder()
                .message("Specialty deactivated successfully")
                .build();
    }
}
