package com.clinic.service;

import com.clinic.dto.response.InvoiceResponse;
import com.clinic.entity.Invoice;
import com.clinic.entity.Payment;
import com.clinic.entity.enums.PaymentMethod;
import com.clinic.entity.enums.PaymentStatus;
import com.clinic.exception.AppException;
import com.clinic.exception.ErrorCode;
import com.clinic.repository.InvoiceRepository;
import com.clinic.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationService notificationService;

    @Transactional
    public Invoice createInvoiceFromPayment(Payment payment) {
        log.info("Creating invoice for payment: {}", payment.getId());

        // Format: INV-yyyyMMdd-last4UUID
        String uuidSuffix = payment.getId().toString().substring(0, 8).toUpperCase();
        String datePrefix = LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
        String invoiceNumber = "INV-" + datePrefix + "-" + uuidSuffix;

        // Structured JSON items for Invoice
        String items = String.format(
                "[{\"description\": \"Phí khám bệnh - Lịch hẹn %s\", \"quantity\": 1, \"price\": %s, \"total\": %s}]",
                payment.getAppointment().getId(),
                payment.getAmount(),
                payment.getAmount());

        Invoice invoice = Invoice.builder()
                .payment(payment)
                .invoiceNumber(invoiceNumber)
                .items(items)
                .subtotal(payment.getAmount())
                .taxRate(BigDecimal.ZERO)
                .taxAmount(BigDecimal.ZERO)
                .total(payment.getAmount())
                .issuedAt(LocalDateTime.now())
                .build();

        return invoiceRepository.save(invoice);
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponse> getAllInvoices() {
        return invoiceRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceResponseById(UUID id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));
        return mapToResponse(invoice);
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceByPaymentId(UUID paymentId) {
        Invoice invoice = invoiceRepository.findByPaymentId(paymentId)
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));
        return mapToResponse(invoice);
    }

    public boolean existsByPaymentId(UUID paymentId) {
        return invoiceRepository.existsByPaymentId(paymentId);
    }

    @Transactional
    public InvoiceResponse markAsPaid(UUID invoiceId, String paymentMethod) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));

        Payment payment = invoice.getPayment();
        if (payment.getStatus() == PaymentStatus.COMPLETED) {
            throw new RuntimeException("Invoice already paid");
        }

        PaymentMethod method = PaymentMethod.CASH;
        try {
            method = PaymentMethod.valueOf(paymentMethod.toUpperCase());
        } catch (IllegalArgumentException ignored) {
        }

        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setPaymentMethod(method);
        payment.setPaidAt(LocalDateTime.now());
        paymentRepository.save(payment);

        log.info("Invoice {} marked as paid manually via {}", invoiceId, method);

        // Web Notification to Patient
        notificationService.sendNotification(
                payment.getAppointment().getPatient().getUser(),
                "Thanh toán thành công",
                "Hóa đơn " + invoice.getInvoiceNumber() + " cho lịch hẹn ngày "
                        + payment.getAppointment().getAppointmentDate()
                        + " đã được thanh toán thành công (Tiền mặt)",
                com.clinic.entity.enums.NotificationType.PAYMENT,
                "INVOICE",
                invoice.getId());

        return mapToResponse(invoice);
    }

    private InvoiceResponse mapToResponse(Invoice invoice) {
        Payment payment = invoice.getPayment();

        InvoiceResponse.InvoiceResponseBuilder builder = InvoiceResponse.builder()
                .id(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .items(invoice.getItems())
                .subtotal(invoice.getSubtotal())
                .taxRate(invoice.getTaxRate())
                .taxAmount(invoice.getTaxAmount())
                .total(invoice.getTotal())
                .issuedAt(invoice.getIssuedAt());

        if (payment != null) {
            builder.paymentId(payment.getId())
                    .paymentMethod(payment.getPaymentMethod() != null ? payment.getPaymentMethod().name() : null)
                    .paymentStatus(payment.getStatus() != null ? payment.getStatus().name() : null);

            if (payment.getAppointment() != null) {
                var apt = payment.getAppointment();
                builder.appointmentId(apt.getId())
                        .appointmentDate(apt.getAppointmentDate());

                if (apt.getPatient() != null && apt.getPatient().getUser() != null) {
                    builder.patientName(apt.getPatient().getUser().getFullName());
                }
                if (apt.getDoctor() != null && apt.getDoctor().getUser() != null) {
                    builder.doctorName(apt.getDoctor().getUser().getFullName());
                }
                if (apt.getSpecialty() != null) {
                    builder.specialtyName(apt.getSpecialty().getName());
                }
            }
        }

        return builder.build();
    }
}
