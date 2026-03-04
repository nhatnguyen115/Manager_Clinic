package com.clinic.service;

import com.clinic.config.VNPayConfig;
import com.clinic.dto.request.PaymentRequest;
import com.clinic.dto.response.PaymentResponse;
import com.clinic.entity.Appointment;
import com.clinic.entity.Payment;
import com.clinic.entity.enums.AppointmentStatus;
import com.clinic.entity.enums.PaymentMethod;
import com.clinic.entity.enums.PaymentStatus;
import com.clinic.exception.AppException;
import com.clinic.exception.ErrorCode;
import com.clinic.repository.AppointmentRepository;
import com.clinic.repository.PaymentRepository;
import com.clinic.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VNPayService {

    private final VNPayConfig vnPayConfig;
    private final AppointmentRepository appointmentRepository;
    private final PaymentRepository paymentRepository;

    @Transactional
    public PaymentResponse createPaymentUrl(PaymentRequest request, String ipAddr) {
        log.info("Creating VNPay payment URL for appointment: {}", request.getAppointmentId());

        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_FOUND));

        // Reuse existing PENDING payment, or create a new one
        Payment payment = paymentRepository.findByAppointmentIdAndStatus(
                appointment.getId(), PaymentStatus.PENDING)
                .orElseGet(() -> Payment.builder()
                        .appointment(appointment)
                        .patient(appointment.getPatient())
                        .amount(appointment.getDoctor().getConsultationFee())
                        .paymentMethod(PaymentMethod.VNPAY)
                        .status(PaymentStatus.PENDING)
                        .build());
        payment = paymentRepository.save(payment);

        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String vnp_OrderInfo = "Thanh toan lich hen " + appointment.getId();
        String orderType = "other";
        String vnp_TxnRef = payment.getId().toString();

        long amount = appointment.getDoctor().getConsultationFee().multiply(new BigDecimal(100)).longValue();

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnPayConfig.getTmnCode());
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", vnp_OrderInfo);
        vnp_Params.put("vnp_OrderType", orderType);
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
        vnp_Params.put("vnp_IpAddr", ipAddr);
        vnp_Params.put("vnp_Locale", "vn");

        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        String vnp_CreateDate = now.format(formatter);
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        // Expire in 15 minutes
        String vnp_ExpireDate = now.plusMinutes(15).format(formatter);
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                // Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));

                // Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));

                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String queryUrl = query.toString();
        String vnp_SecureHash = VNPayConfig.hmacSHA512(vnPayConfig.getHashSecret(), hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        String paymentUrl = vnPayConfig.getUrl() + "?" + queryUrl;

        log.debug("Generated VNPay URL: {}", paymentUrl);
        return PaymentResponse.builder()
                .paymentUrl(paymentUrl)
                .paymentId(payment.getId())
                .build();
    }

    private final InvoiceService invoiceService;

    @Transactional
    public void processCallback(Map<String, String> params) {
        log.info("Processing VNPay callback for TxnRef: {}", params.get("vnp_TxnRef"));

        String vnp_SecureHash = params.get("vnp_SecureHash");
        params.remove("vnp_SecureHashType");
        params.remove("vnp_SecureHash");

        // Verify hash
        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (itr.hasNext()) {
                    hashData.append('&');
                }
            }
        }

        String checkSum = VNPayConfig.hmacSHA512(vnPayConfig.getHashSecret(), hashData.toString());
        if (!checkSum.equals(vnp_SecureHash)) {
            log.error("Invalid VNPay signature for TxnRef: {}. Expected: {}, Received: {}",
                    params.get("vnp_TxnRef"), checkSum, vnp_SecureHash);
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        String txnRef = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");
        String transactionStatus = params.get("vnp_TransactionStatus");

        Payment payment = paymentRepository.findById(UUID.fromString(txnRef))
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));

        if ("00".equals(responseCode) && "00".equals(transactionStatus)) {
            if (payment.getStatus() != PaymentStatus.COMPLETED) {
                log.info("Payment successful for TxnRef: {}. Generating invoice...", txnRef);
                payment.setStatus(PaymentStatus.COMPLETED);
                payment.setPaidAt(LocalDateTime.now());
                payment.setTransactionId(params.get("vnp_TransactionNo"));

                // Create Invoice
                invoiceService.createInvoiceFromPayment(payment);
            } else {
                log.warn("Payment already marked as COMPLETED for TxnRef: {}", txnRef);
            }
        } else {
            log.warn("Payment failed or cancelled for TxnRef: {}. ResponseCode: {}, Status: {}",
                    txnRef, responseCode, transactionStatus);
            payment.setStatus(PaymentStatus.FAILED);
        }

        // Save raw response
        payment.setVnpayResponse(params.toString());
        paymentRepository.save(payment);
    }

    /**
     * Confirm payment from browser return URL (no signature check).
     * Called by frontend after VNPay redirects back.
     * Idempotent: safe to call multiple times.
     */
    @Transactional
    public PaymentResponse confirmReturnPayment(String txnRef, String responseCode,
            String transactionStatus, String transactionNo) {
        log.info("Confirming return for txnRef={}, responseCode={}", txnRef, responseCode);

        Payment payment = paymentRepository.findById(UUID.fromString(txnRef))
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));

        if (payment.getStatus() == PaymentStatus.COMPLETED) {
            log.info("Payment {} already COMPLETED — skipping", txnRef);
            return mapToResponse(payment);
        }

        boolean success = "00".equals(responseCode) && "00".equals(transactionStatus);

        if (success) {
            payment.setStatus(PaymentStatus.COMPLETED);
            payment.setPaidAt(LocalDateTime.now());
            if (transactionNo != null && !transactionNo.isBlank()) {
                payment.setTransactionId(transactionNo);
            }
            paymentRepository.save(payment);

            // Create invoice only if not already created
            boolean invoiceExists = invoiceService.existsByPaymentId(payment.getId());
            if (!invoiceExists) {
                invoiceService.createInvoiceFromPayment(payment);
                log.info("Invoice created for payment {}", txnRef);
            }
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            log.warn("Return payment failed/cancelled for txnRef={}", txnRef);
        }

        return mapToResponse(payment);
    }

    @Transactional
    public List<PaymentResponse> getPatientPaymentHistory() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();
        UUID userId = userDetails.getId();

        // 1. Fetch all billable appointments
        List<Appointment> appointments = appointmentRepository.findAllByPatientUserIdAndStatusIn(
                userId, List.of(AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED));

        // 2. Ensure each has a payment record (auto-create PENDING if missing)
        for (Appointment app : appointments) {
            boolean hasPayment = paymentRepository.findByAppointmentIdAndStatus(app.getId(), PaymentStatus.PENDING)
                    .isPresent()
                    || paymentRepository.findByAppointmentIdAndStatus(app.getId(), PaymentStatus.COMPLETED).isPresent();

            if (!hasPayment) {
                log.info("Auto-creating PENDING payment for appointment: {}", app.getId());
                Payment payment = Payment.builder()
                        .appointment(app)
                        .patient(app.getPatient())
                        .amount(app.getDoctor().getConsultationFee())
                        .paymentMethod(PaymentMethod.VNPAY)
                        .status(PaymentStatus.PENDING)
                        .build();
                paymentRepository.save(payment);
            }
        }

        // 3. Return all patient payments (excluding canceled appointments)
        return paymentRepository.findAllByPatientUserId(userId).stream()
                .filter(payment -> payment.getAppointment().getStatus() != AppointmentStatus.CANCELLED)
                .map(this::mapToResponse)
                .sorted((p1, p2) -> p2.getAppointmentDate().compareTo(p1.getAppointmentDate()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentDetail(UUID paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));
        return mapToResponse(payment);
    }

    private PaymentResponse mapToResponse(Payment payment) {
        return PaymentResponse.builder()
                .paymentId(payment.getId())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod().name())
                .status(payment.getStatus().name())
                .transactionId(payment.getTransactionId())
                .paidAt(payment.getPaidAt())
                .appointmentId(payment.getAppointment().getId())
                .doctorName(payment.getAppointment().getDoctor().getUser().getFullName())
                .specialtyName(payment.getAppointment().getSpecialty() != null
                        ? payment.getAppointment().getSpecialty().getName()
                        : "N/A")
                .appointmentDate(payment.getAppointment().getAppointmentDate())
                .build();
    }
}
