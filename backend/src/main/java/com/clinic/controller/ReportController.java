package com.clinic.controller;

import com.clinic.dto.response.ApiResponse;
import com.clinic.dto.response.ReportResponse;
import com.clinic.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<ReportResponse>> getSummaryReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        if (from == null)
            from = LocalDate.now().minusMonths(1);
        if (to == null)
            to = LocalDate.now();

        ReportResponse report = reportService.getSummaryReport(from, to);
        return ResponseEntity.ok(ApiResponse.<ReportResponse>builder()
                .message("Lấy báo cáo tổng quan thành công")
                .result(report)
                .build());
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<org.springframework.core.io.Resource> exportPdf(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        if (from == null)
            from = LocalDate.now().minusMonths(1);
        if (to == null)
            to = LocalDate.now();

        ReportResponse report = reportService.getSummaryReport(from, to);
        java.io.ByteArrayInputStream bis = com.clinic.util.PdfExporter.exportReportToPdf(report);

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=report-" + LocalDate.now() + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                .body(new org.springframework.core.io.InputStreamResource(bis));
    }

    @GetMapping("/export/excel")
    public ResponseEntity<org.springframework.core.io.Resource> exportExcel(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to)
            throws java.io.IOException {

        if (from == null)
            from = LocalDate.now().minusMonths(1);
        if (to == null)
            to = LocalDate.now();

        ReportResponse report = reportService.getSummaryReport(from, to);
        java.io.ByteArrayInputStream bis = com.clinic.util.ExcelExporter.exportReportToExcel(report);

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=report-" + LocalDate.now() + ".xlsx");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(org.springframework.http.MediaType
                        .parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new org.springframework.core.io.InputStreamResource(bis));
    }
}
