package com.clinic.controller;

import com.clinic.dto.request.MedicalRecordRequest;
import com.clinic.dto.response.ApiResponse;
import com.clinic.dto.response.MedicalRecordResponse;
import com.clinic.service.MedicalRecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/medical-records")
@RequiredArgsConstructor
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ApiResponse<MedicalRecordResponse> createMedicalRecord(@Valid @RequestBody MedicalRecordRequest request) {
        return ApiResponse.<MedicalRecordResponse>builder()
                .result(medicalRecordService.createMedicalRecord(request))
                .build();
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR') or @patientSecurity.isOwner(#patientId, principal)")
    public ApiResponse<List<MedicalRecordResponse>> getRecordsByPatient(@PathVariable UUID patientId) {
        return ApiResponse.<List<MedicalRecordResponse>>builder()
                .result(medicalRecordService.getRecordsByPatient(patientId))
                .build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @medicalRecordSecurity.isAuthorized(#id, principal)")
    public ApiResponse<MedicalRecordResponse> getRecordById(@PathVariable UUID id) {
        return ApiResponse.<MedicalRecordResponse>builder()
                .result(medicalRecordService.getRecordById(id))
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('DOCTOR') and @medicalRecordSecurity.isAuthorized(#id, principal)")
    public ApiResponse<MedicalRecordResponse> updateMedicalRecord(
            @PathVariable UUID id,
            @Valid @RequestBody MedicalRecordRequest request) {
        return ApiResponse.<MedicalRecordResponse>builder()
                .result(medicalRecordService.updateMedicalRecord(id, request))
                .build();
    }
}
