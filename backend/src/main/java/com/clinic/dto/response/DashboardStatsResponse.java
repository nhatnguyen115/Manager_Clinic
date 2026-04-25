package com.clinic.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DashboardStatsResponse {
    long totalUsers;
    long totalDoctors;
    long totalPatients;
    long todayAppointments;
    long monthAppointments;
    long pendingAppointments;
    List<MonthlyStatItem> monthlyAppointmentStats;
    List<SpecialtyStatItem> specialtyDistribution;
    List<RecentActivityItem> recentActivities;
    PaymentStats paymentStats;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class MonthlyStatItem {
        String month; // "2026-01", "2026-02"
        long count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class SpecialtyStatItem {
        String name;
        long count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class RecentActivityItem {
        String action;
        String entityType;
        String description;
        java.time.LocalDateTime timestamp;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class PaymentStats {
        long totalPayments;
        long completedPayments;
        double successRate;
    }
}
