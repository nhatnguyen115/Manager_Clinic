package com.clinic.repository;

import com.clinic.entity.Appointment;
import com.clinic.entity.enums.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    Page<Appointment> findByPatientId(UUID patientId, Pageable pageable);

    Page<Appointment> findByDoctorId(UUID doctorId, Pageable pageable);

    List<Appointment> findByDoctorIdAndAppointmentDate(UUID doctorId, LocalDate date);

    Page<Appointment> findByPatientIdAndStatus(UUID patientId, AppointmentStatus status, Pageable pageable);

    Page<Appointment> findByDoctorIdAndStatus(UUID doctorId, AppointmentStatus status, Pageable pageable);

    @Query("SELECT a FROM Appointment a WHERE " +
            "a.doctor.id = :doctorId AND " +
            "a.appointmentDate = :date AND " +
            "a.appointmentTime = :time AND " +
            "a.status NOT IN ('CANCELLED')")
    Optional<Appointment> findExistingAppointment(
            @Param("doctorId") UUID doctorId,
            @Param("date") LocalDate date,
            @Param("time") LocalTime time);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE " +
            "a.doctor.id = :doctorId AND " +
            "a.appointmentDate = :date AND " +
            "a.status NOT IN ('CANCELLED')")
    long countByDoctorAndDate(@Param("doctorId") UUID doctorId, @Param("date") LocalDate date);

    List<Appointment> findByAppointmentDateAndStatus(LocalDate date, AppointmentStatus status);
}
