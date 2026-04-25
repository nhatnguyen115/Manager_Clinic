package com.clinic.controller;

import com.clinic.dto.request.DoctorRequest;
import com.clinic.dto.request.ScheduleUpdateRequest;
import com.clinic.dto.response.ApiResponse;
import com.clinic.dto.response.DoctorResponse;
import com.clinic.dto.response.ScheduleResponse;
import com.clinic.service.DoctorService;
import com.clinic.service.ScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

        private final DoctorService doctorService;
        private final ScheduleService scheduleService;

        @PostMapping
        @PreAuthorize("hasRole('ADMIN')")
        public ApiResponse<DoctorResponse> createDoctor(@Valid @RequestBody DoctorRequest request) {
                return ApiResponse.<DoctorResponse>builder()
                                .result(doctorService.createDoctor(request))
                                .build();
        }

        @GetMapping
        public ApiResponse<List<DoctorResponse>> getAllDoctors(
                        @RequestParam(required = false) UUID specialtyId) {
                return ApiResponse.<List<DoctorResponse>>builder()
                                .result(doctorService.getAllDoctors(specialtyId))
                                .build();
        }

        @GetMapping("/{id}")
        public ApiResponse<DoctorResponse> getDoctorById(@PathVariable UUID id) {
                return ApiResponse.<DoctorResponse>builder()
                                .result(doctorService.getDoctorById(id))
                                .build();
        }

        @PutMapping("/{id}")
        @PreAuthorize("hasRole('ADMIN') or @doctorSecurity.isOwner(#id, principal)")
        public ApiResponse<DoctorResponse> updateDoctor(@PathVariable UUID id,
                        @Valid @RequestBody DoctorRequest request) {
                return ApiResponse.<DoctorResponse>builder()
                                .result(doctorService.updateDoctor(id, request))
                                .build();
        }

        @GetMapping("/{id}/schedule")
        @PreAuthorize("permitAll()")
        public ApiResponse<List<ScheduleResponse>> getDoctorSchedule(@PathVariable UUID id) {
                return ApiResponse.<List<ScheduleResponse>>builder()
                                .result(scheduleService.getDoctorSchedule(id))
                                .build();
        }

        @PutMapping("/{id}/schedule")
        @PreAuthorize("hasRole('ADMIN') or @doctorSecurity.isOwner(#id, principal)")
        public ApiResponse<List<ScheduleResponse>> updateDoctorSchedule(
                        @PathVariable UUID id,
                        @RequestBody List<ScheduleUpdateRequest> requests) {
                return ApiResponse.<List<ScheduleResponse>>builder()
                                .result(scheduleService.updateDoctorSchedule(id, requests))
                                .build();
        }
}
