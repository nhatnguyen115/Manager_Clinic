package com.clinic.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentResponse {
    String paymentUrl;
    java.util.UUID paymentId;
    java.math.BigDecimal amount;
    String paymentMethod;
    String status;
    String transactionId;
    java.time.LocalDateTime paidAt;
    java.util.UUID appointmentId;
    String doctorName;
    String specialtyName;
    java.time.LocalDate appointmentDate;
}
