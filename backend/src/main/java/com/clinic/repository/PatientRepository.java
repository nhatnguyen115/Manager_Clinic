package com.clinic.repository;

import com.clinic.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientRepository extends JpaRepository<Patient, UUID> {

        @Query("SELECT p FROM Patient p JOIN FETCH p.user WHERE p.user.id = :userId")
        Optional<Patient> findByUserId(@Param("userId") UUID userId);

        @Query("SELECT p FROM Patient p JOIN FETCH p.user WHERE p.user.email = :email")
        Optional<Patient> findByUserEmail(@Param("email") String email);

        @Query("SELECT p FROM Patient p JOIN FETCH p.user WHERE p.user.id = :userId")
        Optional<Patient> findByUserIdWithUser(@Param("userId") UUID userId);

        @Query("SELECT p FROM Patient p JOIN FETCH p.user WHERE p.id = :id")
        Optional<Patient> findByIdWithUser(@Param("id") UUID id);

        @Query("SELECT p.gender, COUNT(p) FROM Patient p GROUP BY p.gender")
        List<Object[]> getGenderDistribution();

        @Query("SELECT " +
                        "CASE " +
                        "  WHEN (YEAR(CURRENT_DATE) - YEAR(p.dateOfBirth)) < 18 THEN '0-17' " +
                        "  WHEN (YEAR(CURRENT_DATE) - YEAR(p.dateOfBirth)) BETWEEN 18 AND 60 THEN '18-60' " +
                        "  ELSE '61+' " +
                        "END, COUNT(p.id) " +
                        "FROM Patient p " +
                        "GROUP BY " +
                        "CASE " +
                        "  WHEN (YEAR(CURRENT_DATE) - YEAR(p.dateOfBirth)) < 18 THEN '0-17' " +
                        "  WHEN (YEAR(CURRENT_DATE) - YEAR(p.dateOfBirth)) BETWEEN 18 AND 60 THEN '18-60' " +
                        "  ELSE '61+' " +
                        "END")
        List<Object[]> getAgeDistribution();

        @Query("SELECT DISTINCT p FROM Patient p JOIN FETCH p.user " +
                        "WHERE p.id IN (SELECT a.patient.id FROM Appointment a WHERE a.doctor.id = :doctorId) " +
                        "OR p.id IN (SELECT mr.patient.id FROM MedicalRecord mr WHERE mr.doctor.id = :doctorId)")
        List<Patient> findDistinctPatientsByDoctorId(@Param("doctorId") UUID doctorId);
}
