package com.clinic.dto.response;

import com.clinic.entity.enums.PaymentMethod;
import com.clinic.entity.enums.PaymentStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InvoiceResponse {
    UUID id;
    String invoiceNumber;
    String items;
    BigDecimal subtotal;
    BigDecimal taxRate;
    BigDecimal taxAmount;
    BigDecimal total;
    LocalDateTime issuedAt;

    // Enriched fields
    UUID paymentId;
    UUID appointmentId;
    String patientName;
    String doctorName;
    String specialtyName;
    LocalDate appointmentDate;
    String paymentMethod;
    String paymentStatus;
}
