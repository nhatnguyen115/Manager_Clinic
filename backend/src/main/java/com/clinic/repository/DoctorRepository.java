package com.clinic.repository;

import com.clinic.entity.Doctor;
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
public interface DoctorRepository extends JpaRepository<Doctor, UUID> {

    Optional<Doctor> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);

    Optional<Doctor> findByUserEmail(String email);

    Page<Doctor> findByIsAvailableTrue(Pageable pageable);

    Page<Doctor> findBySpecialtyIdAndIsAvailableTrue(UUID specialtyId, Pageable pageable);

    @Query("SELECT d FROM Doctor d JOIN d.user u WHERE " +
            "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "AND d.isAvailable = true")
    Page<Doctor> searchByName(@Param("search") String search, Pageable pageable);

    @Query("SELECT d FROM Doctor d WHERE d.isAvailable = true ORDER BY d.avgRating DESC")
    List<Doctor> findTopRated(Pageable pageable);
}
