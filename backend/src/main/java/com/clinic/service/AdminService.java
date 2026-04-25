package com.clinic.service;

import com.clinic.dto.request.AdminUserRequest;
import com.clinic.dto.response.AppointmentResponse;
import com.clinic.dto.response.DashboardStatsResponse;
import com.clinic.dto.response.UserResponse;
import com.clinic.entity.*;
import com.clinic.entity.enums.AppointmentStatus;
import com.clinic.entity.enums.RoleName;
import com.clinic.exception.AppException;
import com.clinic.exception.ErrorCode;
import com.clinic.repository.*;
import com.clinic.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final SpecialtyRepository specialtyRepository;
    private final RoleRepository roleRepository;
    private final PaymentRepository paymentRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;
    private final AuditLogRepository auditLogRepository;

    // ════════════════════════════════════════
    // Dashboard Stats
    // ════════════════════════════════════════

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalDoctors = doctorRepository.count();
        long totalPatients = patientRepository.count();

        LocalDate today = LocalDate.now();
        List<Appointment> todayAppts = appointmentRepository
                .findByAppointmentDateAndStatus(today, AppointmentStatus.CONFIRMED);
        long todayPending = appointmentRepository
                .findByAppointmentDateAndStatus(today, AppointmentStatus.PENDING).size();
        long todayAppointments = todayAppts.size() + todayPending;

        // Monthly appointments (current month)
        LocalDate monthStart = today.withDayOfMonth(1);
        long monthAppointments = appointmentRepository.countByDateRange(monthStart, today);

        // Pending appointments system-wide
        long pendingAppointments = appointmentRepository.countByStatus(AppointmentStatus.PENDING);

        // Monthly trend (last 6 months)
        List<DashboardStatsResponse.MonthlyStatItem> monthlyStats = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            YearMonth ym = YearMonth.now().minusMonths(i);
            LocalDate start = ym.atDay(1);
            LocalDate end = ym.atEndOfMonth();
            long count = appointmentRepository.countByDateRange(start, end);
            monthlyStats.add(DashboardStatsResponse.MonthlyStatItem.builder()
                    .month(ym.format(DateTimeFormatter.ofPattern("yyyy-MM")))
                    .count(count)
                    .build());
        }

        // Specialty distribution
        List<Object[]> specialtyCounts = appointmentRepository.countBySpecialty();
        List<DashboardStatsResponse.SpecialtyStatItem> specialtyDist = specialtyCounts.stream()
                .map(row -> DashboardStatsResponse.SpecialtyStatItem.builder()
                        .name((String) row[0])
                        .count((Long) row[1])
                        .build())
                .collect(Collectors.toList());

        // Recent activities
        List<AuditLog> recentLogs = auditLogRepository.findTop10ByOrderByCreatedAtDesc();
        List<DashboardStatsResponse.RecentActivityItem> recentActivities = recentLogs.stream()
                .map(log -> DashboardStatsResponse.RecentActivityItem.builder()
                        .action(log.getAction())
                        .entityType(log.getEntityType())
                        .description(formatActivityDescription(log))
                        .timestamp(log.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        // Payment stats
        long totalPayments = paymentRepository.count();
        long completedPayments = paymentRepository.countByStatus(com.clinic.entity.enums.PaymentStatus.COMPLETED);
        double successRate = totalPayments > 0 ? (double) completedPayments * 100 / totalPayments : 0;

        return DashboardStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalDoctors(totalDoctors)
                .totalPatients(totalPatients)
                .todayAppointments(todayAppointments)
                .monthAppointments(monthAppointments)
                .pendingAppointments(pendingAppointments)
                .monthlyAppointmentStats(monthlyStats)
                .specialtyDistribution(specialtyDist)
                .recentActivities(recentActivities)
                .paymentStats(DashboardStatsResponse.PaymentStats.builder()
                        .totalPayments(totalPayments)
                        .completedPayments(completedPayments)
                        .successRate(successRate)
                        .build())
                .build();
    }

    private String formatActivityDescription(AuditLog log) {
        if (log.getAction() == null)
            return "Hoạt động không xác định";

        String entity = log.getEntityType() != null ? log.getEntityType().toLowerCase() : "thông tin";
        switch (log.getAction().toUpperCase()) {
            case "LOGIN":
                return "Người dùng đăng nhập vào hệ thống";
            case "CREATE_APPOINTMENT":
                return "Lịch hẹn mới đã được đặt";
            case "UPDATE_APPOINTMENT":
                return "Cập nhật trạng thái lịch hẹn";
            case "CANCEL_APPOINTMENT":
                return "Lịch hẹn đã bị hủy";
            case "CREATE_USER":
                return "Người dùng mới được tạo: " + entity;
            case "UPDATE_USER":
                return "Cập nhật thông tin người dùng: " + entity;
            case "TOGGLE_USER_STATUS":
                return "Thay đổi trạng thái hoạt động: " + entity;
            case "UPDATE_PROFILE":
                return "Cập nhật thông tin cá nhân";
            default:
                return log.getAction() + " " + entity;
        }
    }

    // ════════════════════════════════════════
    // User Management
    // ════════════════════════════════════════

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers(String role, String search) {
        List<User> users;

        if (role != null && !role.isEmpty() && !"ALL".equalsIgnoreCase(role)) {
            RoleName roleName = RoleName.valueOf(role.toUpperCase());
            users = userRepository.findByRoleName(roleName);
        } else {
            users = userRepository.findAll();
        }

        if (search != null && !search.isEmpty()) {
            String lowerSearch = search.toLowerCase();
            users = users.stream()
                    .filter(u -> (u.getFullName() != null && u.getFullName().toLowerCase().contains(lowerSearch))
                            || (u.getEmail() != null && u.getEmail().toLowerCase().contains(lowerSearch)))
                    .collect(Collectors.toList());
        }

        return users.stream().map(this::mapToUserResponse).collect(Collectors.toList());
    }

    @Transactional
    public UserResponse createUser(AdminUserRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        RoleName roleName = RoleName.valueOf(request.getRole().toUpperCase());
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));

        log.info("DEBUG: Creating user via Admin. Email: '{}', Role: {}, IsActive (request): {}", email, roleName,
                request.getIsActive());

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(role)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        User savedUser = userRepository.save(user);

        // Auto-create patient/doctor profile
        if (roleName == RoleName.PATIENT) {
            Patient patient = Patient.builder()
                    .user(savedUser)
                    .dateOfBirth(request.getDateOfBirth())
                    .gender(request.getGender() != null ? com.clinic.entity.enums.Gender.valueOf(request.getGender())
                            : null)
                    .address(request.getAddress())
                    .build();
            patientRepository.save(patient);
        } else if (roleName == RoleName.DOCTOR) {
            Specialty specialty = null;
            if (request.getSpecialtyId() != null) {
                specialty = specialtyRepository.findById(request.getSpecialtyId())
                        .orElse(null);
            }

            Doctor doctor = Doctor.builder()
                    .user(savedUser)
                    .specialty(specialty)
                    .licenseNumber(request.getLicenseNumber())
                    .experienceYears(request.getExperienceYears())
                    .consultationFee(request.getConsultationFee())
                    .isAvailable(true)
                    .build();
            doctorRepository.save(doctor);
        }

        CustomUserDetails userDetails = (CustomUserDetails) org.springframework.security.core.context.SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
        auditLogService.log(userDetails.getId(), "CREATE_USER", "USER", savedUser.getId().toString());

        return mapToUserResponse(savedUser);
    }

    @Transactional
    public UserResponse updateUser(UUID id, AdminUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());

        if (request.getIsActive() != null) {
            user.setIsActive(request.getIsActive());
        }

        // Role change
        if (request.getRole() != null) {
            RoleName roleName = RoleName.valueOf(request.getRole().toUpperCase());
            Role role = roleRepository.findByName(roleName)
                    .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));
            user.setRole(role);
        }

        User savedUser = userRepository.save(user);

        CustomUserDetails userDetails = (CustomUserDetails) org.springframework.security.core.context.SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
        auditLogService.log(userDetails.getId(), "UPDATE_USER", "USER", savedUser.getId().toString());

        return mapToUserResponse(savedUser);
    }

    @Transactional
    public UserResponse toggleUserActive(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        user.setIsActive(!user.getIsActive());
        User savedUser = userRepository.save(user);

        CustomUserDetails userDetails = (CustomUserDetails) org.springframework.security.core.context.SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
        auditLogService.log(userDetails.getId(), "TOGGLE_USER_STATUS", "USER", savedUser.getId().toString());

        return mapToUserResponse(savedUser);
    }

    @Transactional
    public void resetUserPassword(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Generate temporary password
        String tempPassword = UUID.randomUUID().toString().substring(0, 8);
        user.setPasswordHash(passwordEncoder.encode(tempPassword));
        userRepository.save(user);

        log.info("Password reset for user {}. Temp password: {}", user.getEmail(), tempPassword);
    }

    // ════════════════════════════════════════
    // Appointment Management (Admin)
    // ════════════════════════════════════════

    private final AppointmentService appointmentService;

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAllAppointments(LocalDate dateFrom, LocalDate dateTo,
            UUID doctorId, String status) {
        AppointmentStatus appointmentStatus = null;
        if (status != null && !status.isEmpty() && !"ALL".equalsIgnoreCase(status)) {
            try {
                appointmentStatus = AppointmentStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid status provided for appointment filtering: {}", status);
            }
        }

        return appointmentRepository.findAllForAdmin(dateFrom, dateTo, doctorId, appointmentStatus).stream()
                .map(appointmentService::mapToResponse)
                .collect(Collectors.toList());
    }

    // ════════════════════════════════════════
    // CSV Export
    // ════════════════════════════════════════

    @Transactional(readOnly = true)
    public byte[] exportUsersCsv() {
        List<User> users = userRepository.findAll();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(out);

        writer.println("ID,Email,Full Name,Phone,Role,Active,Created At");
        for (User u : users) {
            writer.printf("%s,%s,%s,%s,%s,%s,%s%n",
                    u.getId(),
                    escapeCsv(u.getEmail()),
                    escapeCsv(u.getFullName()),
                    escapeCsv(u.getPhone()),
                    u.getRole() != null ? u.getRole().getName() : "",
                    u.getIsActive(),
                    u.getCreatedAt());
        }
        writer.flush();
        return out.toByteArray();
    }

    @Transactional(readOnly = true)
    public byte[] exportPatientsCsv() {
        List<Patient> patients = patientRepository.findAll();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(out);

        writer.println("ID,Full Name,Email,Phone,Date of Birth,Gender,Address,Blood Type");
        for (Patient p : patients) {
            User u = p.getUser();
            writer.printf("%s,%s,%s,%s,%s,%s,%s,%s%n",
                    p.getId(),
                    escapeCsv(u != null ? u.getFullName() : ""),
                    escapeCsv(u != null ? u.getEmail() : ""),
                    escapeCsv(u != null ? u.getPhone() : ""),
                    p.getDateOfBirth(),
                    p.getGender(),
                    escapeCsv(p.getAddress()),
                    escapeCsv(p.getBloodType()));
        }
        writer.flush();
        return out.toByteArray();
    }

    @Transactional(readOnly = true)
    public byte[] exportAppointmentsCsv(LocalDate dateFrom, LocalDate dateTo) {
        List<Appointment> appointments = appointmentRepository.findAllForAdmin(dateFrom, dateTo, null, null);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(out);

        writer.println("ID,Patient,Doctor,Specialty,Date,Time,Status,Symptoms");
        for (Appointment a : appointments) {
            writer.printf("%s,%s,%s,%s,%s,%s,%s,%s%n",
                    a.getId(),
                    escapeCsv(a.getPatient() != null && a.getPatient().getUser() != null
                            ? a.getPatient().getUser().getFullName()
                            : ""),
                    escapeCsv(a.getDoctor() != null && a.getDoctor().getUser() != null
                            ? a.getDoctor().getUser().getFullName()
                            : ""),
                    escapeCsv(a.getSpecialty() != null ? a.getSpecialty().getName() : ""),
                    a.getAppointmentDate(),
                    a.getAppointmentTime(),
                    a.getStatus(),
                    escapeCsv(a.getSymptoms()));
        }
        writer.flush();
        return out.toByteArray();
    }

    // ════════════════════════════════════════
    // Helpers
    // ════════════════════════════════════════

    private UserResponse mapToUserResponse(User user) {
        UUID doctorId = null;
        UUID patientId = null;

        if (user.getRole() != null && user.getRole().getName() != null) {
            String roleName = user.getRole().getName().name();
            if ("DOCTOR".equals(roleName)) {
                doctorId = doctorRepository.findByUserId(user.getId())
                        .map(Doctor::getId).orElse(null);
            } else if ("PATIENT".equals(roleName)) {
                patientId = patientRepository.findByUserId(user.getId())
                        .map(Patient::getId).orElse(null);
            }
        }

        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole() != null ? user.getRole().getName().name() : null)
                .isActive(user.getIsActive())
                .doctorId(doctorId)
                .patientId(patientId)
                .build();
    }

    private String escapeCsv(String value) {
        if (value == null)
            return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
