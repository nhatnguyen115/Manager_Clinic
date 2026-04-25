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
public class MedicalRecordService {

        private final MedicalRecordRepository medicalRecordRepository;
        private final AppointmentRepository appointmentRepository;
        private final PrescriptionRepository prescriptionRepository;
        private final MedicineRepository medicineRepository;

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

                CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext()
                                .getAuthentication()
                                .getPrincipal();
                // Verify doctor ownership or admin
                if (!appointment.getDoctor().getUser().getId().equals(userDetails.getId())) {
                        // Should also allow admin, but for now strict to doctor
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

                return mapToResponse(record);
        }

        public List<MedicalRecordResponse> getRecordsByPatient(UUID patientId) {
                return medicalRecordRepository.findByPatientIdOrderByCreatedAtDesc(patientId).stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
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

                return mapToResponse(medicalRecordRepository.save(record));
        }

        private MedicalRecordResponse mapToResponse(MedicalRecord record) {
                MedicalRecordResponse.PrescriptionResponse prescriptionResp = null;
                if (record.getPrescription() != null) {
                        Prescription p = record.getPrescription();
                        prescriptionResp = MedicalRecordResponse.PrescriptionResponse.builder()
                                        .id(p.getId())
                                        .prescriptionNumber(p.getPrescriptionNumber())
                                        .notes(p.getNotes())
                                        .validUntil(p.getValidUntil())
                                        .createdAt(p.getCreatedAt())
                                        .details(p.getDetails().stream()
                                                        .map(d -> PrescriptionDetailResponse.builder()
                                                                        .id(d.getId())
                                                                        .medicineId(d.getMedicine().getId())
                                                                        .medicineName(d.getMedicine().getName())
                                                                        .dosage(d.getDosage())
                                                                        .frequency(d.getFrequency())
                                                                        .duration(d.getDuration())
                                                                        .instructions(d.getInstructions())
                                                                        .quantity(d.getQuantity())
                                                                        .createdAt(d.getCreatedAt())
                                                                        .build())
                                                        .collect(Collectors.toList()))
                                        .build();
                }

                return MedicalRecordResponse.builder()
                                .id(record.getId())
                                .appointmentId(record.getAppointment().getId())
                                .patientId(record.getPatient().getId())
                                .patientName(record.getPatient().getUser().getFullName())
                                .doctorId(record.getDoctor().getId())
                                .doctorName(record.getDoctor().getUser().getFullName())
                                .diagnosis(record.getDiagnosis())
                                .symptoms(record.getSymptoms())
                                .vitalSigns(record.getVitalSigns())
                                .treatment(record.getTreatment())
                                .notes(record.getNotes())
                                .followUpDate(record.getFollowUpDate())
                                .attachments(record.getAttachments())
                                .prescription(prescriptionResp)
                                .createdAt(record.getCreatedAt())
                                .updatedAt(record.getUpdatedAt())
                                .build();
        }
}
