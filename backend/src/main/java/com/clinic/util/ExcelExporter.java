package com.clinic.util;

import com.clinic.dto.response.ReportResponse;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

public class ExcelExporter {

    public static ByteArrayInputStream exportReportToExcel(ReportResponse report) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Báo cáo tổng quan");

            // Define Header Style
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());

            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);
            headerCellStyle.setFillForegroundColor(IndexedColors.BLUE_GREY.getIndex());
            headerCellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Row 0: Summary Header
            Row headerRow = sheet.createRow(0);
            headerRow.createCell(0).setCellValue("Chỉ số");
            headerRow.createCell(1).setCellValue("Giá trị");
            for (int i = 0; i < 2; i++) {
                headerRow.getCell(i).setCellStyle(headerCellStyle);
            }

            // Data Rows
            Row row1 = sheet.createRow(1);
            row1.createCell(0).setCellValue("Tổng doanh thu");
            row1.createCell(1).setCellValue(report.getTotalRevenue().doubleValue());

            Row row2 = sheet.createRow(2);
            row2.createCell(0).setCellValue("Tổng lịch hẹn");
            row2.createCell(1).setCellValue(report.getTotalAppointments());

            Row row3 = sheet.createRow(3);
            row3.createCell(0).setCellValue("Lịch hẹn hoàn thành");
            row3.createCell(1).setCellValue(report.getCompletedAppointments());

            Row row4 = sheet.createRow(4);
            row4.createCell(0).setCellValue("Tổng bệnh nhân");
            row4.createCell(1).setCellValue(report.getTotalPatients());

            // Specialty Distribution Sheet
            Sheet specialtySheet = workbook.createSheet("Phân bố chuyên khoa");
            Row specialtyHeader = specialtySheet.createRow(0);
            specialtyHeader.createCell(0).setCellValue("Chuyên khoa");
            specialtyHeader.createCell(1).setCellValue("Số lượng");
            for (int i = 0; i < 2; i++)
                specialtyHeader.getCell(i).setCellStyle(headerCellStyle);

            int rowIdx = 1;
            for (ReportResponse.CategoryStat stat : report.getSpecialtyDistribution()) {
                Row row = specialtySheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(stat.getCategory());
                row.createCell(1).setCellValue(stat.getCount());
            }

            // Status Distribution Sheet
            Sheet statusSheet = workbook.createSheet("Trạng thái lịch hẹn");
            Row statusHeader = statusSheet.createRow(0);
            statusHeader.createCell(0).setCellValue("Trạng thái");
            statusHeader.createCell(1).setCellValue("Số lượng");
            for (int i = 0; i < 2; i++)
                statusHeader.getCell(i).setCellStyle(headerCellStyle);
            rowIdx = 1;
            for (ReportResponse.CategoryStat stat : report.getStatusDistribution()) {
                Row row = statusSheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(stat.getCategory());
                row.createCell(1).setCellValue(stat.getCount());
            }

            // Revenue Trend Sheet
            Sheet revTrendSheet = workbook.createSheet("Xu hướng doanh thu");
            Row revHeader = revTrendSheet.createRow(0);
            revHeader.createCell(0).setCellValue("Ngày");
            revHeader.createCell(1).setCellValue("Doanh thu");
            revHeader.createCell(2).setCellValue("Số giao dịch");
            for (int i = 0; i < 3; i++)
                revHeader.getCell(i).setCellStyle(headerCellStyle);
            rowIdx = 1;
            for (ReportResponse.DataPoint dp : report.getRevenueTrend()) {
                Row row = revTrendSheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(dp.getLabel());
                row.createCell(1).setCellValue(dp.getValue().doubleValue());
                row.createCell(2).setCellValue(dp.getCount());
            }

            // User Trend Sheet
            Sheet userTrendSheet = workbook.createSheet("Người dùng mới");
            Row userHeader = userTrendSheet.createRow(0);
            userHeader.createCell(0).setCellValue("Ngày");
            userHeader.createCell(1).setCellValue("Số người đăng ký");
            for (int i = 0; i < 2; i++)
                userHeader.getCell(i).setCellStyle(headerCellStyle);
            rowIdx = 1;
            for (ReportResponse.DataPoint dp : report.getUserRegistrationTrend()) {
                Row row = userTrendSheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(dp.getLabel());
                row.createCell(1).setCellValue(dp.getCount());
            }

            // Doctor Performance Sheet
            Sheet doctorSheet = workbook.createSheet("Hiệu suất bác sĩ");
            Row doctorHeader = doctorSheet.createRow(0);
            doctorHeader.createCell(0).setCellValue("Bác sĩ");
            doctorHeader.createCell(1).setCellValue("Số ca khám");
            doctorHeader.createCell(2).setCellValue("Doanh thu");
            doctorHeader.createCell(3).setCellValue("Đánh giá");
            for (int i = 0; i < 4; i++)
                doctorHeader.getCell(i).setCellStyle(headerCellStyle);

            rowIdx = 1;
            for (ReportResponse.DoctorPerformance perf : report.getDoctorPerformance()) {
                Row row = doctorSheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(perf.getDoctorName());
                row.createCell(1).setCellValue(perf.getAppointmentCount());
                row.createCell(2).setCellValue(perf.getTotalRevenue().doubleValue());
                row.createCell(3).setCellValue(perf.getAverageRating());
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }
}
