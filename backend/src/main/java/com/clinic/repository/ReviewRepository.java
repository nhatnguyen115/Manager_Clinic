package com.clinic.repository;

import com.clinic.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {

    Page<Review> findByDoctorIdAndIsVisibleTrue(UUID doctorId, Pageable pageable);

    Page<Review> findByPatientId(UUID patientId, Pageable pageable);

    Optional<Review> findByAppointmentId(UUID appointmentId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.doctor.id = :doctorId AND r.isVisible = true")
    Double getAverageRatingByDoctorId(@Param("doctorId") UUID doctorId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.doctor.id = :doctorId AND r.isVisible = true")
    Long countByDoctorId(@Param("doctorId") UUID doctorId);

    List<Review> findByDoctorIdAndIsVisibleTrueOrderByCreatedAtDesc(UUID doctorId);
}
