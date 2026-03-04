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
}
