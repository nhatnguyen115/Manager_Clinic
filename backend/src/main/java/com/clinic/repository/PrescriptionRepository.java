package com.clinic.repository;

import com.clinic.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, UUID> {

    Optional<Prescription> findByMedicalRecordId(UUID medicalRecordId);

    Optional<Prescription> findByPrescriptionNumber(String prescriptionNumber);
}
