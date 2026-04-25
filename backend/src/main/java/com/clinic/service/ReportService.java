package com.clinic.service;

import com.clinic.dto.response.ReportResponse;
import com.clinic.repository.AppointmentRepository;
import com.clinic.repository.PaymentRepository;
import com.clinic.repository.PatientRepository;
import com.clinic.repository.UserRepository;
import com.clinic.util.ExcelExporter;
import com.clinic.util.PdfExporter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ReportService {

        private final AppointmentRepository appointmentRepository;
        private final PaymentRepository paymentRepository;
        private final PatientRepository patientRepository;
        private final UserRepository userRepository;

        public ReportResponse getSummaryReport(LocalDate from, LocalDate to) {
                LocalDateTime start = from.atStartOfDay();
                LocalDateTime end = to.atTime(LocalTime.MAX);

                // 1. Overview
                BigDecimal totalRevenue = paymentRepository.getTotalRevenue(start, end);
                if (totalRevenue == null)
                        totalRevenue = BigDecimal.ZERO;

                long totalAppointments = appointmentRepository.countByDateRange(from, to);
                long completedAppointments = appointmentRepository.countByDateRangeAndStatus(from, to,
                                com.clinic.entity.enums.AppointmentStatus.COMPLETED);

                long totalPatients = patientRepository.count();

                // 2. Trends
                List<ReportResponse.DataPoint> revenueTrend = paymentRepository.getRevenueTrend(start, end).stream()
                                .map(row -> ReportResponse.DataPoint.builder()
                                                .label(row[0].toString())
                                                .value((BigDecimal) row[1])
                                                .count((Long) row[2])
                                                .build())
                                .collect(Collectors.toList());

                List<ReportResponse.DataPoint> appointmentTrend = appointmentRepository.getAppointmentTrend(from, to)
                                .stream()
                                .map(row -> ReportResponse.DataPoint.builder()
                                                .label(row[0].toString())
                                                .count((Long) row[1])
                                                .build())
                                .collect(Collectors.toList());

                // 3. Distributions
                List<ReportResponse.CategoryStat> specialtyDistribution = appointmentRepository.countBySpecialty()
                                .stream()
                                .map(row -> ReportResponse.CategoryStat.builder()
                                                .category((String) row[0])
                                                .count((Long) row[1])
                                                .build())
                                .collect(Collectors.toList());

                List<ReportResponse.CategoryStat> statusDistribution = appointmentRepository.countByStatusDistribution()
                                .stream()
                                .map(row -> ReportResponse.CategoryStat.builder()
                                                .category(row[0].toString())
                                                .count((Long) row[1])
                                                .build())
                                .collect(Collectors.toList());

                List<ReportResponse.CategoryStat> genderDistribution = patientRepository.getGenderDistribution()
                                .stream()
                                .map(row -> ReportResponse.CategoryStat.builder()
                                                .category(row[0] != null ? row[0].toString() : "UNKNOWN")
                                                .count((Long) row[1])
                                                .build())
                                .collect(Collectors.toList());

                List<ReportResponse.CategoryStat> ageDistribution = patientRepository.getAgeDistribution().stream()
                                .map(row -> ReportResponse.CategoryStat.builder()
                                                .category((String) row[0])
                                                .count((Long) row[1])
                                                .build())
                                .collect(Collectors.toList());

                // 4. Performance
                List<ReportResponse.DoctorPerformance> doctorPerformance = appointmentRepository
                                .getDoctorPerformance(from, to)
                                .stream()
                                .map(row -> ReportResponse.DoctorPerformance.builder()
                                                .doctorName((String) row[0])
                                                .appointmentCount((Long) row[1])
                                                .totalRevenue((BigDecimal) row[2])
                                                .averageRating(row[3] != null ? ((Number) row[3]).doubleValue() : 0.0)
                                                .build())
                                .collect(Collectors.toList());

                // 5. Usage metrics
                List<ReportResponse.DataPoint> userRegistrationTrend = userRepository
                                .getUserRegistrationTrend(start, end)
                                .stream()
                                .map(row -> ReportResponse.DataPoint.builder()
                                                .label(row[0].toString())
                                                .count((Long) row[1])
                                                .build())
                                .collect(Collectors.toList());

                List<ReportResponse.CategoryStat> roleDistribution = userRepository.getRoleDistribution().stream()
                                .map(row -> ReportResponse.CategoryStat.builder()
                                                .category(row[0].toString())
                                                .count((Long) row[1])
                                                .build())
                                .collect(Collectors.toList());

                return ReportResponse.builder()
                                .totalRevenue(totalRevenue)
                                .totalAppointments(totalAppointments)
                                .completedAppointments(completedAppointments)
                                .totalPatients(totalPatients)
                                .revenueTrend(revenueTrend)
                                .appointmentTrend(appointmentTrend)
                                .specialtyDistribution(specialtyDistribution)
                                .statusDistribution(statusDistribution)
                                .genderDistribution(genderDistribution)
                                .ageDistribution(ageDistribution)
                                .doctorPerformance(doctorPerformance)
                                .userRegistrationTrend(userRegistrationTrend)
                                .roleDistribution(roleDistribution)
                                .build();
        }
}
