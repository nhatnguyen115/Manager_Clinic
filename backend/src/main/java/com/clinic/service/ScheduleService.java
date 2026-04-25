package com.clinic.service;

import com.clinic.dto.request.ScheduleUpdateRequest;
import com.clinic.dto.request.TimeSlotRequest;
import com.clinic.dto.response.ScheduleResponse;
import com.clinic.dto.response.TimeSlotResponse;
import com.clinic.entity.Doctor;
import com.clinic.entity.TimeSlot;
import com.clinic.entity.WorkingSchedule;
import com.clinic.exception.AppException;
import com.clinic.exception.ErrorCode;
import com.clinic.repository.DoctorRepository;
import com.clinic.repository.TimeSlotRepository;
import com.clinic.repository.WorkingScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final WorkingScheduleRepository scheduleRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final DoctorRepository doctorRepository;

    @Transactional(readOnly = true)
    public List<ScheduleResponse> getDoctorSchedule(UUID doctorId) {
        return scheduleRepository.findByDoctorId(doctorId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<ScheduleResponse> updateDoctorSchedule(UUID doctorId, List<ScheduleUpdateRequest> requests) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Simplification: Delete old schedules and create new ones
        // In production, we might want to update existing ones to preserve IDs if
        // needed
        List<WorkingSchedule> oldSchedules = scheduleRepository.findByDoctorId(doctorId);
        for (WorkingSchedule old : oldSchedules) {
            timeSlotRepository.deleteByScheduleId(old.getId());
        }
        scheduleRepository.deleteAll(oldSchedules);

        return requests.stream()
                .map(req -> {
                    WorkingSchedule schedule = WorkingSchedule.builder()
                            .doctor(doctor)
                            .dayOfWeek(req.getDayOfWeek())
                            .specificDate(req.getSpecificDate())
                            .isAvailable(req.getIsAvailable())
                            .notes(req.getNotes())
                            .build();
                    WorkingSchedule saved = scheduleRepository.save(schedule);

                    if (req.getTimeSlots() != null) {
                        List<TimeSlot> slots = req.getTimeSlots().stream()
                                .map(slotReq -> TimeSlot.builder()
                                        .schedule(saved)
                                        .startTime(slotReq.getStartTime())
                                        .endTime(slotReq.getEndTime())
                                        .maxPatients(slotReq.getMaxPatients())
                                        .isAvailable(slotReq.getIsAvailable())
                                        .build())
                                .collect(Collectors.toList());
                        timeSlotRepository.saveAll(slots);
                    }
                    return mapToResponse(saved);
                })
                .collect(Collectors.toList());
    }

    private ScheduleResponse mapToResponse(WorkingSchedule schedule) {
        List<TimeSlotResponse> slots = timeSlotRepository.findByScheduleId(schedule.getId()).stream()
                .map(ts -> TimeSlotResponse.builder()
                        .id(ts.getId())
                        .startTime(ts.getStartTime())
                        .endTime(ts.getEndTime())
                        .maxPatients(ts.getMaxPatients())
                        .isAvailable(ts.getIsAvailable())
                        .build())
                .collect(Collectors.toList());

        return ScheduleResponse.builder()
                .id(schedule.getId())
                .dayOfWeek(schedule.getDayOfWeek())
                .specificDate(schedule.getSpecificDate())
                .isAvailable(schedule.getIsAvailable())
                .notes(schedule.getNotes())
                .timeSlots(slots)
                .build();
    }
}
