package com.clinic.service;

import com.clinic.dto.request.MedicalRecordRequest;
import com.clinic.dto.request.PrescriptionDetailRequest;
import com.clinic.dto.response.MedicalRecordResponse;
import com.clinic.dto.response.PrescriptionDetailResponse;
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
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class MedicalRecordService {

        private final MedicalRecordRepository medicalRecordRepository;
        private final AppointmentRepository appointmentRepository;
        private final PrescriptionRepository prescriptionRepository;
        private final MedicineRepository medicineRepository;
        private final PatientRepository patientRepository;
        private final NotificationService notificationService;

        @Transactional
        public MedicalRecordResponse createMedicalRecord(MedicalRecordRequest request) {
                Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                                .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_FOUND));

                if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
                        // Already has a record? OneToOne check
                        if (medicalRecordRepository.findByAppointmentId(appointment.getId()).isPresent()) {
                                throw new AppException(ErrorCode.INVALID_KEY); // Or specifically RECORD_ALREADY_EXISTS
                        }
                }

                Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
                if (!(principal instanceof CustomUserDetails)) {
                        log.error("Principal is not CustomUserDetails: {}", principal);
                        throw new AppException(ErrorCode.UNAUTHENTICATED);
                }
                CustomUserDetails userDetails = (CustomUserDetails) principal;

                // Verify doctor ownership or admin
                if (appointment.getDoctor() == null || appointment.getDoctor().getUser() == null) {
                        log.error("Data inconsistency: Appointment {} has no doctor or doctor has no user",
                                         appointment.getId());
                        throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
                }

                if (!appointment.getDoctor().getUser().getId().equals(userDetails.getId())) {
                        // throw new AppException(ErrorCode.UNAUTHORIZED);
                }

                MedicalRecord record = MedicalRecord.builder()
                                .appointment(appointment)
                                .patient(appointment.getPatient())
                                .doctor(appointment.getDoctor())
                                .diagnosis(request.getDiagnosis())
                                .symptoms(request.getSymptoms())
                                .vitalSigns(request.getVitalSigns())
                                .treatment(request.getTreatment())
                                .notes(request.getNotes())
                                .followUpDate(request.getFollowUpDate())
                                .build();

                record = medicalRecordRepository.save(record);

                appointment.setActualFee(request.getActualFee());

                // Update appointment status to COMPLETED
                appointment.setStatus(AppointmentStatus.COMPLETED);
                appointment.setCompletedAt(java.time.LocalDateTime.now());
                appointmentRepository.save(appointment);

                // Prescription
                if (request.getPrescriptionDetails() != null && !request.getPrescriptionDetails().isEmpty()) {
                        Prescription prescription = Prescription.builder()
                                        .medicalRecord(record)
                                        .prescriptionNumber("RX-" + System.currentTimeMillis())
                                        .validUntil(LocalDate.now().plusMonths(1))
                                        .details(new ArrayList<>())
                                        .build();

                        for (PrescriptionDetailRequest detailReq : request.getPrescriptionDetails()) {
                                Medicine medicine = medicineRepository.findById(detailReq.getMedicineId())
                                                .orElseThrow(() -> new AppException(ErrorCode.MEDICINE_NOT_FOUND));

                                PrescriptionDetail detail = PrescriptionDetail.builder()
                                                .prescription(prescription)
                                                .medicine(medicine)
                                                .dosage(detailReq.getDosage())
                                                .frequency(detailReq.getFrequency())
                                                .duration(detailReq.getDuration())
                                                .instructions(detailReq.getInstructions())
                                                .quantity(detailReq.getQuantity())
                                                .build();
                                prescription.getDetails().add(detail);
                        }
                        prescriptionRepository.save(prescription);
                        record.setPrescription(prescription);
                }

                try {
                        // Web Notification to Patient
                        User patientUser = appointment.getPatient() != null ? appointment.getPatient().getUser() : null;
                        if (patientUser != null) {
                                String doctorName = (appointment.getDoctor() != null && appointment.getDoctor().getUser() != null)
                                                ? appointment.getDoctor().getUser().getFullName()
                                                : "Bác sĩ";

                                try {
                                        notificationService.sendNotification(
                                                        patientUser,
                                                        "Có bệnh án mới",
                                                        "Bác sĩ " + doctorName
                                                                        + " đã cập nhật bệnh án cho lịch hẹn ngày "
                                                                        + appointment.getAppointmentDate(),
                                                        com.clinic.entity.enums.NotificationType.APPOINTMENT,
                                                        "MEDICAL_RECORD",
                                                        record.getId());
                                } catch (Exception ne) {
                                        log.warn("Failed to send notification for medical record {}, but continuing: {}", 
                                                record.getId(), ne.getMessage());
                                }
                        }
                } catch (Exception e) {
                        log.error("Error during post-creation processing of medical record: ", e);
                }

                try {
                        return mapToResponse(record);
                } catch (Exception e) {
                        log.error("Critical error mapping medical record to response: ", e);
                        // Return a minimal response instead of 500 if mapping fails
                        return MedicalRecordResponse.builder()
                                        .id(record.getId())
                                        .appointmentId(appointment.getId())
                                        .diagnosis(record.getDiagnosis())
                                        .build();
                }
        }

        public List<MedicalRecordResponse> getRecordsByPatient(UUID patientId) {
                return medicalRecordRepository.findByPatientIdOrderByCreatedAtDesc(patientId).stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        public List<MedicalRecordResponse> getMyRecords() {
                CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext()
                                .getAuthentication()
                                .getPrincipal();

                Patient patient = patientRepository.findByUserId(userDetails.getId())
                                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

                return getRecordsByPatient(patient.getId());
        }

        public MedicalRecordResponse getRecordById(UUID id) {
                MedicalRecord record = medicalRecordRepository.findById(id)
                                .orElseThrow(() -> new AppException(ErrorCode.INVALID_KEY)); // Record Not Found
                return mapToResponse(record);
        }

        @Transactional
        public MedicalRecordResponse updateMedicalRecord(UUID id, MedicalRecordRequest request) {
                MedicalRecord record = medicalRecordRepository.findById(id)
                                .orElseThrow(() -> new AppException(ErrorCode.INVALID_KEY));

                record.setDiagnosis(request.getDiagnosis());
                record.setSymptoms(request.getSymptoms());
                record.setVitalSigns(request.getVitalSigns());
                record.setTreatment(request.getTreatment());
                record.setNotes(request.getNotes());
                record.setFollowUpDate(request.getFollowUpDate());
                record.getAppointment().setActualFee(request.getActualFee());

                try {
                        MedicalRecord savedRecord = medicalRecordRepository.save(record);
                        appointmentRepository.save(record.getAppointment());
                        return mapToResponse(savedRecord);
                } catch (Exception e) {
                        log.error("Error saving or mapping medical record: ", e);
                        throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
                }
        }

        private MedicalRecordResponse mapToResponse(MedicalRecord record) {
                MedicalRecordResponse.PrescriptionResponse prescriptionResp = null;
                if (record.getPrescription() != null) {
                        Prescription p = record.getPrescription();
                        try {
                                prescriptionResp = MedicalRecordResponse.PrescriptionResponse.builder()
                                                .id(p.getId())
                                                .prescriptionNumber(p.getPrescriptionNumber())
                                                .notes(p.getNotes())
                                                .validUntil(p.getValidUntil())
                                                .createdAt(p.getCreatedAt())
                                                .details(p.getDetails().stream()
                                                                .map(d -> {
                                                                        if (d.getMedicine() == null) {
                                                                                log.error("PrescriptionDetail {} has no medicine",
                                                                                                d.getId());
                                                                                return null;
                                                                        }
                                                                        return PrescriptionDetailResponse.builder()
                                                                                        .id(d.getId())
                                                                                        .medicineId(d.getMedicine()
                                                                                                        .getId())
                                                                                        .medicineName(d.getMedicine()
                                                                                                        .getName())
                                                                                        .dosage(d.getDosage())
                                                                                        .frequency(d.getFrequency())
                                                                                        .duration(d.getDuration())
                                                                                        .instructions(d.getInstructions())
                                                                                        .quantity(d.getQuantity())
                                                                                        .createdAt(d.getCreatedAt())
                                                                                        .build();
                                                                })
                                                                .filter(java.util.Objects::nonNull)
                                                                .collect(Collectors.toList()))
                                                .build();
                        } catch (Exception e) {
                                log.error("Error mapping prescription to response: ", e);
                                // Continue without prescription if it fails mapping
                        }
                }

                String patientName = "Bệnh nhân";
                if (record.getPatient() != null) {
                        if (record.getPatient().getUser() != null) {
                                patientName = record.getPatient().getUser().getFullName();
                        }
                }

                String doctorName = "Bác sĩ";
                if (record.getDoctor() != null && record.getDoctor().getUser() != null) {
                        doctorName = record.getDoctor().getUser().getFullName();
                }

                return MedicalRecordResponse.builder()
                                .id(record.getId())
                                .appointmentId(record.getAppointment() != null ? record.getAppointment().getId() : null)
                                .patientId(record.getPatient() != null ? record.getPatient().getId() : null)
                                .patientName(patientName)
                                .doctorId(record.getDoctor() != null ? record.getDoctor().getId() : null)
                                .doctorName(doctorName)
                                .diagnosis(record.getDiagnosis())
                                .symptoms(record.getSymptoms())
                                .vitalSigns(record.getVitalSigns())
                                .treatment(record.getTreatment())
                                .notes(record.getNotes())
                                .followUpDate(record.getFollowUpDate())
                                .actualFee(record.getAppointment() != null ? record.getAppointment().getActualFee() : null)
                                .attachments(record.getAttachments())
                                .prescription(prescriptionResp)
                                .createdAt(record.getCreatedAt())
                                .updatedAt(record.getUpdatedAt())
                                .build();
        }
}
