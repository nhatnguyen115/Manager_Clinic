package com.clinic.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReportResponse {

    // Overview metrics
    BigDecimal totalRevenue;
    long totalAppointments;
    long completedAppointments;
    long totalPatients;

    // Trends
    List<DataPoint> revenueTrend;
    List<DataPoint> appointmentTrend;

    // Distributions
    List<CategoryStat> specialtyDistribution;
    List<CategoryStat> statusDistribution;
    List<CategoryStat> genderDistribution;
    List<CategoryStat> ageDistribution;

    // Performance
    List<DoctorPerformance> doctorPerformance;

    // Usage Metrics
    List<DataPoint> userRegistrationTrend;
    List<CategoryStat> roleDistribution;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DataPoint {
        String label; // e.g., "2026-03-01" or "Tháng 3"
        BigDecimal value;
        Long count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryStat {
        String category;
        long count;
        BigDecimal value;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DoctorPerformance {
        String doctorName;
        long appointmentCount;
        BigDecimal totalRevenue;
        double averageRating;
    }
}
