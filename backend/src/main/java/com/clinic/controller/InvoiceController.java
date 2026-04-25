package com.clinic.controller;

import com.clinic.dto.response.ApiResponse;
import com.clinic.dto.response.InvoiceResponse;
import com.clinic.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<InvoiceResponse>> getAllInvoices() {
        return ApiResponse.<List<InvoiceResponse>>builder()
                .result(invoiceService.getAllInvoices())
                .build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    public ApiResponse<InvoiceResponse> getInvoiceById(@PathVariable UUID id) {
        return ApiResponse.<InvoiceResponse>builder()
                .result(invoiceService.getInvoiceResponseById(id))
                .build();
    }

    @GetMapping("/payment/{paymentId}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    public ApiResponse<InvoiceResponse> getInvoiceByPaymentId(@PathVariable UUID paymentId) {
        return ApiResponse.<InvoiceResponse>builder()
                .result(invoiceService.getInvoiceByPaymentId(paymentId))
                .build();
    }

    @PatchMapping("/{id}/mark-paid")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<InvoiceResponse> markAsPaid(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "CASH") String paymentMethod) {
        return ApiResponse.<InvoiceResponse>builder()
                .result(invoiceService.markAsPaid(id, paymentMethod))
                .build();
    }
}
