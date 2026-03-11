package com.clinic.repository;

import com.clinic.entity.MedicalRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, UUID> {

    Page<MedicalRecord> findByPatientId(UUID patientId, Pageable pageable);

    Page<MedicalRecord> findByDoctorId(UUID doctorId, Pageable pageable);

    Optional<MedicalRecord> findByAppointmentId(UUID appointmentId);

    @org.springframework.data.jpa.repository.Query("SELECT r FROM MedicalRecord r " +
            "JOIN FETCH r.patient p " +
            "JOIN FETCH p.user " +
            "JOIN FETCH r.doctor d " +
            "JOIN FETCH d.user " +
            "WHERE r.id = :id")
    Optional<MedicalRecord> findByIdWithUser(@org.springframework.data.repository.query.Param("id") UUID id);

    @org.springframework.data.jpa.repository.Query("SELECT r FROM MedicalRecord r " +
            "JOIN FETCH r.patient p " +
            "JOIN FETCH p.user " +
            "JOIN FETCH r.doctor d " +
            "JOIN FETCH d.user " +
            "WHERE p.id = :patientId " +
            "ORDER BY r.createdAt DESC")
    List<MedicalRecord> findByPatientIdOrderByCreatedAtDesc(
            @org.springframework.data.repository.query.Param("patientId") UUID patientId);
}
