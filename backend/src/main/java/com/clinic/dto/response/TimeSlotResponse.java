package com.clinic.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TimeSlotResponse {
    Integer id;
    LocalTime startTime;
    LocalTime endTime;
    Integer maxPatients;
    Boolean isAvailable;
}
