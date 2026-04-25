package com.clinic.util;

import com.clinic.dto.response.ReportResponse;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import java.awt.*;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class PdfExporter {

    public static ByteArrayInputStream exportReportToPdf(ReportResponse report) {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Font configurations
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.BLUE);
            Font headFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.WHITE);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

            // Title
            Paragraph title = new Paragraph("BÁO CÁO TỔNG QUAN PHÒNG KHÁM", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // Export Info
            document.add(new Paragraph(
                    "Ngày xuất: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))));
            document.add(new Paragraph(" "));

            // Summary Stats
            document.add(new Paragraph("Thông số tổng quát:", headFont));
            document.add(new Paragraph(
                    "Tổng doanh thu: " + String.format("%,.0f VNĐ", report.getTotalRevenue().doubleValue()),
                    normalFont));
            document.add(new Paragraph("Tổng lịch hẹn: " + report.getTotalAppointments(), normalFont));
            document.add(new Paragraph("Lịch hẹn hoàn thành: " + report.getCompletedAppointments(), normalFont));
            document.add(new Paragraph("Tổng bệnh nhân: " + report.getTotalPatients(), normalFont));
            document.add(new Paragraph(" "));

            // Distribution Table
            document.add(new Paragraph("Phân bố chuyên khoa:", headFont));
            PdfPTable specialtyTable = new PdfPTable(2);
            specialtyTable.setWidthPercentage(50);
            specialtyTable.setHorizontalAlignment(Element.ALIGN_LEFT);
            specialtyTable.setSpacingBefore(10);
            specialtyTable.addCell(new PdfPCell(new Phrase("Chuyên khoa", headFont)) {
                {
                    setBackgroundColor(Color.GRAY);
                }
            });
            specialtyTable.addCell(new PdfPCell(new Phrase("Số lượng", headFont)) {
                {
                    setBackgroundColor(Color.GRAY);
                }
            });
            for (ReportResponse.CategoryStat stat : report.getSpecialtyDistribution()) {
                specialtyTable.addCell(new Phrase(stat.getCategory(), normalFont));
                specialtyTable.addCell(new Phrase(String.valueOf(stat.getCount()), normalFont));
            }
            document.add(specialtyTable);
            document.add(new Paragraph(" "));

            // Performance Table
            document.add(new Paragraph("Hiệu suất bác sĩ:"));
            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10);

            String[] headers = { "Bác sĩ", "Số ca khám", "Doanh thu", "Đánh giá" };
            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header, headFont));
                cell.setBackgroundColor(Color.DARK_GRAY);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(cell);
            }

            for (ReportResponse.DoctorPerformance perf : report.getDoctorPerformance()) {
                table.addCell(new PdfPCell(new Phrase(perf.getDoctorName(), normalFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(perf.getAppointmentCount()), normalFont)));
                table.addCell(new PdfPCell(
                        new Phrase(String.format("%,.0f", perf.getTotalRevenue().doubleValue()), normalFont)));
                table.addCell(new PdfPCell(new Phrase(String.format("%.1f", perf.getAverageRating()), normalFont)));
            }
            document.add(table);

            document.close();
        } catch (DocumentException ex) {
            ex.printStackTrace();
        }

        return new ByteArrayInputStream(out.toByteArray());
    }
}
