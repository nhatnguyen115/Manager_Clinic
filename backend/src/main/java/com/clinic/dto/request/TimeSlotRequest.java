package com.clinic.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TimeSlotRequest {
    LocalTime startTime;
    LocalTime endTime;
    Integer maxPatients;
    Boolean isAvailable;
}
