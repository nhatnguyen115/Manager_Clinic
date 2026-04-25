package com.clinic.controller;

import com.clinic.dto.request.PatientRequest;
import com.clinic.dto.response.ApiResponse;
import com.clinic.dto.response.PatientResponse;
import com.clinic.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ApiResponse<List<PatientResponse>> getAllPatients() {
        return ApiResponse.<List<PatientResponse>>builder()
                .result(patientService.getAllPatients())
                .build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR') or @patientSecurity.isOwner(#id, principal)")
    public ApiResponse<PatientResponse> getPatientById(@PathVariable UUID id) {
        return ApiResponse.<PatientResponse>builder()
                .result(patientService.getPatientById(id))
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR') or @patientSecurity.isOwner(#id, principal)")
    public ApiResponse<PatientResponse> updatePatient(@PathVariable UUID id,
            @Valid @RequestBody PatientRequest request) {
        return ApiResponse.<PatientResponse>builder()
                .result(patientService.updatePatient(id, request))
                .build();
    }
}
