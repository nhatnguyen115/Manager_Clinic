package com.clinic.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ScheduleUpdateRequest {
    Integer dayOfWeek;
    LocalDate specificDate;
    Boolean isAvailable;
    String notes;
    List<TimeSlotRequest> timeSlots;
}
