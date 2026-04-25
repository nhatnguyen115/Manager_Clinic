package com.clinic.controller;

import com.clinic.dto.request.AdminUserRequest;
import com.clinic.dto.response.ApiResponse;
import com.clinic.dto.response.AppointmentResponse;
import com.clinic.dto.response.DashboardStatsResponse;
import com.clinic.dto.response.UserResponse;
import com.clinic.entity.Appointment;
import com.clinic.service.AdminService;
import com.clinic.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

        private final AdminService adminService;
        private final AppointmentService appointmentService;
        private final com.clinic.service.DoctorService doctorService;

        // ════════════════════════════════════════
        // Dashboard
        // ════════════════════════════════════════

        @GetMapping("/dashboard/stats")
        public ApiResponse<DashboardStatsResponse> getDashboardStats() {
                return ApiResponse.<DashboardStatsResponse>builder()
                                .result(adminService.getDashboardStats())
                                .build();
        }

        // ════════════════════════════════════════
        // User Management
        // ════════════════════════════════════════

        @GetMapping("/users")
        public ApiResponse<List<UserResponse>> getAllUsers(
                        @RequestParam(required = false) String role,
                        @RequestParam(required = false) String search) {
                return ApiResponse.<List<UserResponse>>builder()
                                .result(adminService.getAllUsers(role, search))
                                .build();
        }

        @PostMapping("/users")
        public ApiResponse<UserResponse> createUser(@Valid @RequestBody AdminUserRequest request) {
                return ApiResponse.<UserResponse>builder()
                                .result(adminService.createUser(request))
                                .build();
        }

        @PutMapping("/users/{id}")
        public ApiResponse<UserResponse> updateUser(@PathVariable UUID id,
                        @Valid @RequestBody AdminUserRequest request) {
                return ApiResponse.<UserResponse>builder()
                                .result(adminService.updateUser(id, request))
                                .build();
        }

        @PutMapping("/users/{id}/toggle-active")
        public ApiResponse<UserResponse> toggleUserActive(@PathVariable UUID id) {
                return ApiResponse.<UserResponse>builder()
                                .result(adminService.toggleUserActive(id))
                                .build();
        }

        @PutMapping("/users/{id}/reset-password")
        public ApiResponse<Void> resetUserPassword(@PathVariable UUID id) {
                adminService.resetUserPassword(id);
                return ApiResponse.<Void>builder()
                                .message("Password reset successfully")
                                .build();
        }

        // ════════════════════════════════════════
        // Doctor & Specialty Management (Admin)
        // ════════════════════════════════════════

        @PutMapping("/doctors/{id}/specialty")
        public ApiResponse<com.clinic.dto.response.DoctorResponse> updateDoctorSpecialty(
                        @PathVariable UUID id,
                        @RequestParam(required = false) UUID specialtyId) {
                return ApiResponse.<com.clinic.dto.response.DoctorResponse>builder()
                                .result(doctorService.updateDoctorSpecialty(id, specialtyId))
                                .build();
        }

        @GetMapping("/doctors/no-specialty")
        public ApiResponse<List<com.clinic.dto.response.DoctorResponse>> getDoctorsNoSpecialty() {
                return ApiResponse.<List<com.clinic.dto.response.DoctorResponse>>builder()
                                .result(doctorService.getDoctorsNoSpecialty())
                                .build();
        }

        // ════════════════════════════════════════
        // Appointment Management
        // ════════════════════════════════════════

        @GetMapping("/appointments")
        public ApiResponse<List<AppointmentResponse>> getAllAppointments(
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
                        @RequestParam(required = false) UUID doctorId,
                        @RequestParam(required = false) String status) {
                return ApiResponse.<List<AppointmentResponse>>builder()
                                .result(adminService.getAllAppointments(dateFrom, dateTo, doctorId, status))
                                .build();
        }

        // ════════════════════════════════════════
        // CSV Export
        // ════════════════════════════════════════

        @GetMapping("/export/users")
        public ResponseEntity<byte[]> exportUsers() {
                byte[] csv = adminService.exportUsersCsv();
                return ResponseEntity.ok()
                                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=users.csv")
                                .contentType(MediaType.parseMediaType("text/csv"))
                                .body(csv);
        }

        @GetMapping("/export/patients")
        public ResponseEntity<byte[]> exportPatients() {
                byte[] csv = adminService.exportPatientsCsv();
                return ResponseEntity.ok()
                                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=patients.csv")
                                .contentType(MediaType.parseMediaType("text/csv"))
                                .body(csv);
        }

        @GetMapping("/export/appointments")
        public ResponseEntity<byte[]> exportAppointments(
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
                byte[] csv = adminService.exportAppointmentsCsv(dateFrom, dateTo);
                return ResponseEntity.ok()
                                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=appointments.csv")
                                .contentType(MediaType.parseMediaType("text/csv"))
                                .body(csv);
        }
}
