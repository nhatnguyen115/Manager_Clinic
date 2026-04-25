package com.clinic.dto.request;

import com.clinic.entity.enums.AppointmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AppointmentStatusRequest {
    @NotNull(message = "New status is required")
    AppointmentStatus status;
}
