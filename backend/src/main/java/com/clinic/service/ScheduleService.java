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

                // 1. Fetch all existing schedules for this doctor
                List<WorkingSchedule> existingSchedules = scheduleRepository.findByDoctorId(doctorId);

                // 2. Process each request
                return requests.stream().map(req -> {
                        // Find if there's an existing schedule for this day or specific date
                        WorkingSchedule schedule = existingSchedules.stream()
                                        .filter(s -> {
                                                if (req.getSpecificDate() != null) {
                                                        return req.getSpecificDate().equals(s.getSpecificDate());
                                                } else {
                                                        return s.getSpecificDate() == null
                                                                        && req.getDayOfWeek().equals(s.getDayOfWeek());
                                                }
                                        })
                                        .findFirst()
                                        .orElseGet(() -> WorkingSchedule.builder()
                                                        .doctor(doctor)
                                                        .dayOfWeek(req.getDayOfWeek())
                                                        .specificDate(req.getSpecificDate())
                                                        .build());

                        schedule.setIsAvailable(req.getIsAvailable());
                        schedule.setNotes(req.getNotes());
                        WorkingSchedule savedSchedule = scheduleRepository.save(schedule);

                        // 3. Handle Time Slots for this schedule
                        updateTimeSlots(savedSchedule, req.getTimeSlots());

                        return mapToResponse(savedSchedule);
                }).collect(Collectors.toList());

                // Note: We don't delete old schedules here to avoid breaking appointments.
                // In a more advanced version, we could delete unused schedules that have no
                // appointments.
        }

        private void updateTimeSlots(WorkingSchedule schedule, List<TimeSlotRequest> requests) {
                if (requests == null)
                        return;

                List<TimeSlot> existingSlots = timeSlotRepository.findByScheduleId(schedule.getId());

                // Update or Create slots from request
                for (TimeSlotRequest req : requests) {
                        TimeSlot slot = existingSlots.stream()
                                        .filter(s -> s.getStartTime().equals(req.getStartTime())
                                                        && s.getEndTime().equals(req.getEndTime()))
                                        .findFirst()
                                        .orElseGet(() -> TimeSlot.builder()
                                                        .schedule(schedule)
                                                        .startTime(req.getStartTime())
                                                        .endTime(req.getEndTime())
                                                        .build());

                        slot.setMaxPatients(req.getMaxPatients());
                        slot.setIsAvailable(req.getIsAvailable());
                        timeSlotRepository.save(slot);
                }

                // We don't delete slots that are not in the request to prevent FK violations
                // if they have appointments.
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
