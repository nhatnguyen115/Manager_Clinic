package com.clinic.repository;

import com.clinic.entity.WorkingSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface WorkingScheduleRepository extends JpaRepository<WorkingSchedule, Integer> {

        List<WorkingSchedule> findByDoctorId(UUID doctorId);

        List<WorkingSchedule> findByDoctorIdAndIsAvailableTrue(UUID doctorId);

        List<WorkingSchedule> findByDoctorIdAndDayOfWeekAndIsAvailableTrue(UUID doctorId, Integer dayOfWeek);

        @Query("SELECT ws FROM WorkingSchedule ws WHERE " +
                        "ws.doctor.id = :doctorId AND " +
                        "(ws.specificDate = :date OR (ws.specificDate IS NULL AND ws.dayOfWeek = :dayOfWeek)) " +
                        "AND ws.isAvailable = true")
        List<WorkingSchedule> findByDoctorAndDate(
                        @Param("doctorId") UUID doctorId,
                        @Param("date") LocalDate date,
                        @Param("dayOfWeek") Integer dayOfWeek);
}
