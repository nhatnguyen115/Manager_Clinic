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
                        "a.status <> com.clinic.entity.enums.AppointmentStatus.CANCELLED")
        Optional<Appointment> findExistingAppointment(
                        @Param("doctorId") UUID doctorId,
                        @Param("date") LocalDate date,
                        @Param("time") LocalTime time);

        @Query("SELECT COUNT(a) FROM Appointment a WHERE " +
                        "a.doctor.id = :doctorId AND " +
                        "a.appointmentDate = :date AND " +
                        "a.status <> com.clinic.entity.enums.AppointmentStatus.CANCELLED")
        long countByDoctorAndDate(@Param("doctorId") UUID doctorId, @Param("date") LocalDate date);

        List<Appointment> findByAppointmentDateAndStatus(LocalDate date, AppointmentStatus status);

        List<Appointment> findByAppointmentDateAndStatusAndAppointmentTimeBetween(LocalDate date, AppointmentStatus status, LocalTime startTime, LocalTime endTime);

        @Query("SELECT a FROM Appointment a " +
                        "JOIN FETCH a.patient p " +
                        "JOIN FETCH p.user " +
                        "JOIN FETCH a.doctor d " +
                        "JOIN FETCH d.user " +
                        "WHERE a.id = :id")
        Optional<Appointment> findByIdWithUser(@Param("id") UUID id);

        @Query("SELECT DISTINCT a FROM Appointment a " +
                        "JOIN FETCH a.patient p " +
                        "JOIN FETCH p.user " +
                        "JOIN FETCH a.doctor d " +
                        "JOIN FETCH d.user " +
                        "LEFT JOIN FETCH a.specialty " +
                        "JOIN FETCH a.timeSlot " +
                        "WHERE p.user.id = :userId OR d.user.id = :userId")
        List<Appointment> findAllByUserId(@Param("userId") UUID userId);

        @Query("SELECT DISTINCT a FROM Appointment a " +
                        "JOIN FETCH a.patient p " +
                        "JOIN FETCH p.user " +
                        "JOIN FETCH a.doctor d " +
                        "JOIN FETCH d.user " +
                        "LEFT JOIN FETCH a.specialty " +
                        "WHERE p.user.id = :userId AND a.status IN :statuses")
        List<Appointment> findAllByPatientUserIdAndStatusIn(
                        @Param("userId") UUID userId,
                        @Param("statuses") List<AppointmentStatus> statuses);

        // ── Admin queries ──

        @Query("SELECT COUNT(a) FROM Appointment a WHERE a.appointmentDate BETWEEN :from AND :to AND a.status <> com.clinic.entity.enums.AppointmentStatus.CANCELLED")
        long countByDateRange(@Param("from") LocalDate from, @Param("to") LocalDate to);

        @Query("SELECT COUNT(a) FROM Appointment a WHERE a.appointmentDate BETWEEN :from AND :to AND a.status = :status")
        long countByDateRangeAndStatus(@Param("from") LocalDate from, @Param("to") LocalDate to,
                        @Param("status") AppointmentStatus status);

        @Query("SELECT COUNT(a) FROM Appointment a WHERE a.status = :status")
        long countByStatus(@Param("status") AppointmentStatus status);

        @Query("SELECT s.name, COUNT(a) FROM Appointment a JOIN a.specialty s GROUP BY s.name ORDER BY COUNT(a) DESC")
        List<Object[]> countBySpecialty();

        @Query("SELECT a.status, COUNT(a) FROM Appointment a GROUP BY a.status")
        List<Object[]> countByStatusDistribution();

        @Query("SELECT a.appointmentDate, COUNT(a) FROM Appointment a WHERE a.appointmentDate BETWEEN :from AND :to GROUP BY a.appointmentDate ORDER BY a.appointmentDate")
        List<Object[]> getAppointmentTrend(@Param("from") LocalDate from, @Param("to") LocalDate to);

        @Query("SELECT d.user.fullName, COUNT(a.id), SUM(d.consultationFee), AVG(r.rating) " +
                        "FROM Appointment a " +
                        "JOIN a.doctor d " +
                        "LEFT JOIN d.reviews r " +
                        "WHERE a.status = com.clinic.entity.enums.AppointmentStatus.COMPLETED AND a.appointmentDate BETWEEN :from AND :to "
                        +
                        "GROUP BY d.id, d.user.fullName")
        List<Object[]> getDoctorPerformance(@Param("from") LocalDate from, @Param("to") LocalDate to);

        @Query("SELECT DISTINCT a FROM Appointment a " +
                        "LEFT JOIN FETCH a.patient p LEFT JOIN FETCH p.user " +
                        "LEFT JOIN FETCH a.doctor d LEFT JOIN FETCH d.user " +
                        "LEFT JOIN FETCH a.specialty " +
                        "LEFT JOIN FETCH a.timeSlot " +
                        "WHERE (cast(:dateFrom as string) IS NULL OR a.appointmentDate >= :dateFrom) " +
                        "AND (cast(:dateTo as string) IS NULL OR a.appointmentDate <= :dateTo) " +
                        "AND (cast(:doctorId as string) IS NULL OR d.id = :doctorId) " +
                        "AND (cast(:status as string) IS NULL OR a.status = :status) " +
                        "ORDER BY a.appointmentDate DESC, a.appointmentTime DESC")
        List<Appointment> findAllForAdmin(@Param("dateFrom") LocalDate dateFrom,
                        @Param("dateTo") LocalDate dateTo,
                        @Param("doctorId") UUID doctorId,
                        @Param("status") AppointmentStatus status);
}
