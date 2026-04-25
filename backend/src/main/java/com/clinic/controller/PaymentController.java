package com.clinic.controller;

import com.clinic.dto.request.PaymentRequest;
import com.clinic.dto.response.ApiResponse;
import com.clinic.dto.response.PaymentResponse;
import com.clinic.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final VNPayService vnPayService;

    @PostMapping("/create-url")
    @PreAuthorize("hasRole('PATIENT')")
    public ApiResponse<PaymentResponse> createPaymentUrl(
            @Valid @RequestBody PaymentRequest request,
            HttpServletRequest httpServletRequest) {

        String ipAddr = httpServletRequest.getRemoteAddr();
        return ApiResponse.<PaymentResponse>builder()
                .result(vnPayService.createPaymentUrl(request, ipAddr))
                .build();
    }

    @GetMapping("/vnpay-callback")
    public ApiResponse<String> vnpayCallback(@RequestParam Map<String, String> allParams) {
        vnPayService.processCallback(allParams);
        return ApiResponse.<String>builder()
                .result("Payment processed")
                .build();
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('PATIENT')")
    public ApiResponse<java.util.List<PaymentResponse>> getPaymentHistory() {
        return ApiResponse.<java.util.List<PaymentResponse>>builder()
                .result(vnPayService.getPatientPaymentHistory())
                .build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    public ApiResponse<PaymentResponse> getPaymentDetail(@PathVariable java.util.UUID id) {
        return ApiResponse.<PaymentResponse>builder()
                .result(vnPayService.getPaymentDetail(id))
                .build();
    }

    /**
     * Called by frontend after VNPay return redirect.
     * Updates payment status and creates invoice without re-verifying HMAC.
     */
    @PostMapping("/confirm-return")
    @PreAuthorize("hasRole('PATIENT')")
    public ApiResponse<PaymentResponse> confirmReturn(
            @RequestParam String txnRef,
            @RequestParam String responseCode,
            @RequestParam(defaultValue = "00") String transactionStatus,
            @RequestParam(required = false, defaultValue = "") String transactionNo) {
        return ApiResponse.<PaymentResponse>builder()
                .result(vnPayService.confirmReturnPayment(txnRef, responseCode, transactionStatus, transactionNo))
                .build();
    }
}
