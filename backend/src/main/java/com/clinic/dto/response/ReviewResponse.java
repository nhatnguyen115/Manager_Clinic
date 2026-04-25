package com.clinic.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReviewResponse {
    UUID id;
    String patientName;
    UUID doctorId;
    String doctorName;
    Integer rating;
    String comment;
    Boolean isAnonymous;
    String adminResponse;
    LocalDateTime createdAt;
}
