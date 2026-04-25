package com.clinic.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ScheduleResponse {
    Integer id;
    Integer dayOfWeek;
    LocalDate specificDate;
    Boolean isAvailable;
    String notes;
    List<TimeSlotResponse> timeSlots;
}
