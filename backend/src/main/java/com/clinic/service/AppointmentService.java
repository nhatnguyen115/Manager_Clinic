package com.clinic.service;

import com.clinic.dto.request.AppointmentCancelRequest;
import com.clinic.dto.request.AppointmentRequest;
import com.clinic.dto.request.AppointmentStatusRequest;
import com.clinic.dto.response.AppointmentResponse;
import com.clinic.dto.response.TimeSlotResponse;
import com.clinic.entity.*;
import com.clinic.entity.enums.AppointmentStatus;
import com.clinic.exception.AppException;
import com.clinic.exception.ErrorCode;
import com.clinic.repository.*;
import com.clinic.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AppointmentService {

        private final AppointmentRepository appointmentRepository;
        private final PatientRepository patientRepository;
        private final DoctorRepository doctorRepository;
        private final SpecialtyRepository specialtyRepository;
        private final TimeSlotRepository timeSlotRepository;
        private final WorkingScheduleRepository workingScheduleRepository;
        private final UserRepository userRepository;
        private final AuditLogService auditLogService;
        private final EmailService emailService;
        private final NotificationService notificationService;

        @Transactional
        public AppointmentResponse createAppointment(AppointmentRequest request) {
                CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext()
                                .getAuthentication()
                                .getPrincipal();

                Patient patient = patientRepository.findByUserIdWithUser(userDetails.getId())
                                .orElseGet(() -> {
                                        User user = userRepository.findById(userDetails.getId())
                                                        .orElseThrow(() -> new AppException(
                                                                        ErrorCode.USER_NOT_EXISTED));

                                        Patient newPatient = Patient.builder()
                                                        .user(user)
                                                        .build();
                                        return patientRepository.save(newPatient);
                                });

                Doctor doctor = doctorRepository.findByIdWithUser(request.getDoctorId())
                                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

                TimeSlot timeSlot = timeSlotRepository.findById(request.getTimeSlotId())
                                .orElseThrow(() -> new AppException(ErrorCode.INVALID_KEY));

                // Check availability
                appointmentRepository
                                .findExistingAppointment(doctor.getId(), request.getAppointmentDate(),
                                                timeSlot.getStartTime())
                                .ifPresent(a -> {
                                        throw new AppException(ErrorCode.APPOINTMENT_SLOT_TAKEN);
                                });

                Specialty specialty = null;
                if (request.getSpecialtyId() != null) {
                        specialty = specialtyRepository.findById(request.getSpecialtyId()).orElse(null);
                }

                Appointment appointment = Appointment.builder()
                                .patient(patient)
                                .doctor(doctor)
                                .specialty(specialty)
                                .timeSlot(timeSlot)
                                .appointmentDate(request.getAppointmentDate())
                                .appointmentTime(timeSlot.getStartTime())
                                .status(AppointmentStatus.PENDING)
                                .symptoms(request.getSymptoms())
                                .notes(request.getNotes())
                                .build();

                Appointment savedAppointment = appointmentRepository.save(appointment);
                auditLogService.log(userDetails.getId(), "CREATE_APPOINTMENT", "APPOINTMENT",
                                savedAppointment.getId().toString());

                // Send notification email to Doctor
                try {
                        log.info("Preparing to notify doctor {}. ID: {}, Email: {}",
                                        doctor.getUser().getFullName(), doctor.getId(), doctor.getUser().getEmail());

                        java.util.Map<String, Object> variables = new java.util.HashMap<>();
                        variables.put("doctorName", doctor.getUser().getFullName());
                        variables.put("patientName", patient.getUser().getFullName());
                        variables.put("appointmentDate", savedAppointment.getAppointmentDate().toString());
                        variables.put("appointmentTime", savedAppointment.getAppointmentTime().toString());
                        variables.put("symptoms",
                                        savedAppointment.getSymptoms() != null ? savedAppointment.getSymptoms()
                                                        : "Không có");

                        emailService.sendHtmlEmail(doctor.getUser().getEmail(),
                                        "Thông báo lịch hẹn mới - ClinicPro", "appointment-notification-doctor",
                                        variables);

                        // Web Notification to Doctor
                        notificationService.sendNotification(
                                        doctor.getUser(),
                                        "Lịch hẹn mới",
                                        "Bạn có lịch hẹn mới từ " + patient.getUser().getFullName() + " vào ngày "
                                                        + savedAppointment.getAppointmentDate(),
                                        com.clinic.entity.enums.NotificationType.APPOINTMENT,
                                        "APPOINTMENT",
                                        savedAppointment.getId());

                        // Web Notification to Patient
                        notificationService.sendNotification(
                                        patient.getUser(),
                                        "Đặt lịch thành công",
                                        "Lịch hẹn với bác sĩ " + doctor.getUser().getFullName()
                                                        + " đã được tạo thành công",
                                        com.clinic.entity.enums.NotificationType.APPOINTMENT,
                                        "APPOINTMENT",
                                        savedAppointment.getId());

                } catch (Exception e) {
                        log.error("Failed to send doctor/patient notification for appointment {}",
                                        savedAppointment.getId(),
                                        e);
                }

                return mapToResponse(savedAppointment);
        }

        @Transactional(readOnly = true)
        public List<TimeSlotResponse> getAvailableSlots(UUID doctorId, LocalDate date) {
                int dayOfWeek = date.getDayOfWeek().getValue() % 7; // Convert to 0=Sunday, 1=Monday...

                List<WorkingSchedule> schedules = workingScheduleRepository
                                .findByDoctorAndDate(doctorId, date, dayOfWeek);

                if (schedules.isEmpty()) {
                        return Collections.emptyList();
                }

                return schedules.stream()
                                .flatMap(s -> timeSlotRepository.findByScheduleIdAndIsAvailableTrue(s.getId()).stream())
                                .filter(ts -> {
                                        // Check if there is an existing appointment for this exact slot
                                        // Based on current logic where 1 slot = 1 appointment
                                        return appointmentRepository.findExistingAppointment(
                                                        doctorId, date, ts.getStartTime()).isEmpty();
                                })
                                .map(ts -> TimeSlotResponse.builder()
                                                .id(ts.getId())
                                                .startTime(ts.getStartTime())
                                                .endTime(ts.getEndTime())
                                                .maxPatients(ts.getMaxPatients())
                                                .isAvailable(true)
                                                .build())
                                .collect(Collectors.toList());
        }

        public List<AppointmentResponse> getMyAppointments() {
                CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext()
                                .getAuthentication()
                                .getPrincipal();

                UUID userId = userDetails.getId();

                return appointmentRepository.findAllByUserId(userId).stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        public AppointmentResponse getAppointmentById(UUID id) {
                Appointment appointment = appointmentRepository.findById(id)
                                .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_FOUND));
                return mapToResponse(appointment);
        }

        @Transactional
        public AppointmentResponse updateStatus(UUID id, AppointmentStatusRequest request) {
                Appointment appointment = appointmentRepository.findById(id)
                                .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_FOUND));

                appointment.setStatus(request.getStatus());
                if (request.getStatus() == AppointmentStatus.CONFIRMED) {
                        appointment.setConfirmedAt(LocalDateTime.now());

                        // Send confirmation email
                        java.util.Map<String, Object> variables = new java.util.HashMap<>();
                        variables.put("name", appointment.getPatient().getUser().getFullName());
                        variables.put("doctorName", appointment.getDoctor().getUser().getFullName());
                        variables.put("appointmentDate", appointment.getAppointmentDate().toString());
                        variables.put("appointmentTime", appointment.getAppointmentTime().toString());

                        emailService.sendHtmlEmail(appointment.getPatient().getUser().getEmail(),
                                        "Xác nhận lịch hẹn khám - ClinicPro", "appointment-confirmation", variables);

                        // Web Notification to Patient
                        notificationService.sendNotification(
                                        appointment.getPatient().getUser(),
                                        "Lịch hẹn đã được xác nhận",
                                        "Lịch hẹn ngày " + appointment.getAppointmentDate() + " với bác sĩ "
                                                        + appointment.getDoctor().getUser().getFullName()
                                                        + " đã được xác nhận",
                                        com.clinic.entity.enums.NotificationType.APPOINTMENT,
                                        "APPOINTMENT",
                                        appointment.getId());
                } else if (request.getStatus() == AppointmentStatus.COMPLETED) {
                        appointment.setCompletedAt(LocalDateTime.now());

                        // Web Notification to Patient
                        notificationService.sendNotification(
                                        appointment.getPatient().getUser(),
                                        "Khám bệnh hoàn tất",
                                        "Lịch hẹn ngày " + appointment.getAppointmentDate() + " với bác sĩ "
                                                        + appointment.getDoctor().getUser().getFullName()
                                                        + " đã hoàn tất. Bạn có thể xem kết quả trong phần bệnh án.",
                                        com.clinic.entity.enums.NotificationType.APPOINTMENT,
                                        "APPOINTMENT",
                                        appointment.getId());
                }

                Appointment savedAppointment = appointmentRepository.save(appointment);

                CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext()
                                .getAuthentication()
                                .getPrincipal();
                auditLogService.log(userDetails.getId(), "UPDATE_APPOINTMENT", "APPOINTMENT",
                                savedAppointment.getId().toString());

                return mapToResponse(savedAppointment);
        }

        @Transactional
        public AppointmentResponse cancelAppointment(UUID id, AppointmentCancelRequest request) {
                Appointment appointment = appointmentRepository.findById(id)
                                .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_FOUND));

                if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
                        throw new AppException(ErrorCode.APPOINTMENT_CANCEL_FORBIDDEN);
                }

                CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext()
                                .getAuthentication()
                                .getPrincipal();

                appointment.setStatus(AppointmentStatus.CANCELLED);
                appointment.setCancelledBy(userDetails.getId());
                appointment.setCancelledReason(request.getReason());

                Appointment savedAppointment = appointmentRepository.save(appointment);
                auditLogService.log(userDetails.getId(), "CANCEL_APPOINTMENT", "APPOINTMENT",
                                savedAppointment.getId().toString());

                // Send Cancellation Email
                java.util.Map<String, Object> variables = new java.util.HashMap<>();
                variables.put("name", appointment.getPatient().getUser().getFullName());
                variables.put("doctorName", appointment.getDoctor().getUser().getFullName());
                variables.put("appointmentDate", appointment.getAppointmentDate().toString());
                variables.put("appointmentTime", appointment.getAppointmentTime().toString());
                variables.put("reason", request.getReason());

                emailService.sendHtmlEmail(appointment.getPatient().getUser().getEmail(),
                                "Thông báo hủy lịch hẹn - ClinicPro", "appointment-cancelled", variables);

                // Web Notification to Patient (if cancelled by others)
                if (!appointment.getPatient().getUser().getId().equals(userDetails.getId())) {
                        notificationService.sendNotification(
                                        appointment.getPatient().getUser(),
                                        "Lịch hẹn bị hủy",
                                        "Lịch hẹn ngày " + appointment.getAppointmentDate() + " với bác sĩ "
                                                        + appointment.getDoctor().getUser().getFullName()
                                                        + " đã bị hủy. Lý do: " + request.getReason(),
                                        com.clinic.entity.enums.NotificationType.APPOINTMENT,
                                        "APPOINTMENT",
                                        appointment.getId());
                }

                // Web Notification to Doctor (if cancelled by others)
                if (!appointment.getDoctor().getUser().getId().equals(userDetails.getId())) {
                        notificationService.sendNotification(
                                        appointment.getDoctor().getUser(),
                                        "Lịch hẹn bị hủy",
                                        "Bệnh nhân " + appointment.getPatient().getUser().getFullName()
                                                        + " đã hủy lịch hẹn ngày " + appointment.getAppointmentDate(),
                                        com.clinic.entity.enums.NotificationType.APPOINTMENT,
                                        "APPOINTMENT",
                                        appointment.getId());
                }

                return mapToResponse(savedAppointment);
        }

        public AppointmentResponse mapToResponse(Appointment appointment) {
                AppointmentResponse.AppointmentResponseBuilder builder = AppointmentResponse.builder()
                                .id(appointment.getId())
                                .appointmentDate(appointment.getAppointmentDate())
                                .appointmentTime(appointment.getAppointmentTime())
                                .status(appointment.getStatus())
                                .symptoms(appointment.getSymptoms())
                                .notes(appointment.getNotes())
                                .cancelledBy(appointment.getCancelledBy())
                                .cancelledReason(appointment.getCancelledReason())
                                .confirmedAt(appointment.getConfirmedAt())
                                .completedAt(appointment.getCompletedAt())
                                .createdAt(appointment.getCreatedAt())
                                .updatedAt(appointment.getUpdatedAt())
                                .actualFee(appointment.getActualFee());

                if (appointment.getPatient() != null) {
                        builder.patientId(appointment.getPatient().getId());
                        if (appointment.getPatient().getUser() != null) {
                                builder.patientName(appointment.getPatient().getUser().getFullName());
                        }
                }

                if (appointment.getDoctor() != null) {
                        builder.doctorId(appointment.getDoctor().getId());
                        if (appointment.getDoctor().getUser() != null) {
                                builder.doctorName(appointment.getDoctor().getUser().getFullName());
                        }
                        builder.consultationFee(appointment.getDoctor().getConsultationFee());
                }

                if (appointment.getSpecialty() != null) {
                        builder.specialtyId(appointment.getSpecialty().getId());
                        builder.specialtyName(appointment.getSpecialty().getName());
                }

                if (appointment.getTimeSlot() != null) {
                        builder.timeSlotId(appointment.getTimeSlot().getId());
                }

                return builder.build();
        }
}
