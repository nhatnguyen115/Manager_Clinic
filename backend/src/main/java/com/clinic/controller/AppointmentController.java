package com.clinic.controller;

import com.clinic.dto.request.AppointmentCancelRequest;
import com.clinic.dto.request.AppointmentRequest;
import com.clinic.dto.request.AppointmentStatusRequest;
import com.clinic.dto.response.ApiResponse;
import com.clinic.dto.response.AppointmentResponse;
import com.clinic.dto.response.TimeSlotResponse;
import com.clinic.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

        private final AppointmentService appointmentService;

        @PostMapping
        @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
        public ApiResponse<AppointmentResponse> createAppointment(@Valid @RequestBody AppointmentRequest request) {
                return ApiResponse.<AppointmentResponse>builder()
                                .result(appointmentService.createAppointment(request))
                                .build();
        }

        @GetMapping("/available-slots")
        public ApiResponse<List<TimeSlotResponse>> getAvailableSlots(
                        @RequestParam UUID doctorId,
                        @RequestParam LocalDate date) {
                return ApiResponse.<List<TimeSlotResponse>>builder()
                                .result(appointmentService.getAvailableSlots(doctorId, date))
                                .build();
        }

        @GetMapping("/me")
        @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR')")
        public ApiResponse<List<AppointmentResponse>> getMyAppointments() {
                return ApiResponse.<List<AppointmentResponse>>builder()
                                .result(appointmentService.getMyAppointments())
                                .build();
        }

        @GetMapping("/{id}")
        @PreAuthorize("hasRole('ADMIN') or @appointmentSecurity.isAuthorized(#id, principal)")
        public ApiResponse<AppointmentResponse> getAppointmentById(@PathVariable UUID id) {
                return ApiResponse.<AppointmentResponse>builder()
                                .result(appointmentService.getAppointmentById(id))
                                .build();
        }

        @PutMapping("/{id}/status")
        @PreAuthorize("hasRole('ADMIN') or (hasRole('DOCTOR') and @appointmentSecurity.isAuthorized(#id, principal))")
        public ApiResponse<AppointmentResponse> updateStatus(@PathVariable UUID id,
                        @Valid @RequestBody AppointmentStatusRequest request) {
                return ApiResponse.<AppointmentResponse>builder()
                                .result(appointmentService.updateStatus(id, request))
                                .build();
        }

        @PutMapping("/{id}/cancel")
        @PreAuthorize("hasRole('ADMIN') or @appointmentSecurity.isAuthorized(#id, principal)")
        public ApiResponse<AppointmentResponse> cancelAppointment(@PathVariable UUID id,
                        @Valid @RequestBody AppointmentCancelRequest request) {
                return ApiResponse.<AppointmentResponse>builder()
                                .result(appointmentService.cancelAppointment(id, request))
                                .build();
        }
}
