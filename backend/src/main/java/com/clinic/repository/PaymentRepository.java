package com.clinic.repository;

import com.clinic.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

import com.clinic.entity.enums.PaymentStatus;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
        Optional<Payment> findByTransactionId(String transactionId);

        java.util.List<Payment> findAllByPatientUserId(UUID userId);

        long countByStatus(PaymentStatus status);

        Optional<Payment> findByAppointmentIdAndStatus(UUID appointmentId, PaymentStatus status);

        @org.springframework.data.jpa.repository.Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = com.clinic.entity.enums.PaymentStatus.COMPLETED AND p.paidAt BETWEEN :from AND :to")
        java.math.BigDecimal getTotalRevenue(
                        @org.springframework.data.repository.query.Param("from") java.time.LocalDateTime from,
                        @org.springframework.data.repository.query.Param("to") java.time.LocalDateTime to);

        @org.springframework.data.jpa.repository.Query("SELECT CAST(p.paidAt AS date), SUM(p.amount), COUNT(p) " +
                        "FROM Payment p WHERE p.status = com.clinic.entity.enums.PaymentStatus.COMPLETED AND p.paidAt BETWEEN :from AND :to "
                        +
                        "GROUP BY CAST(p.paidAt AS date) ORDER BY CAST(p.paidAt AS date)")
        java.util.List<Object[]> getRevenueTrend(
                        @org.springframework.data.repository.query.Param("from") java.time.LocalDateTime from,
                        @org.springframework.data.repository.query.Param("to") java.time.LocalDateTime to);
}
