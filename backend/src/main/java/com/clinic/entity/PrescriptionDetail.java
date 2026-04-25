package com.clinic.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * PrescriptionDetail entity - medicine details in a prescription.
 */
@Entity
@Table(name = "prescription_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_id", nullable = false)
    private Prescription prescription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;

    @Column(name = "dosage", nullable = false, length = 100)
    private String dosage; // "1 viên"

    @Column(name = "frequency", nullable = false, length = 100)
    private String frequency; // "3 lần/ngày"

    @Column(name = "duration", length = 100)
    private String duration; // "7 ngày"

    @Column(name = "instructions", columnDefinition = "TEXT")
    private String instructions; // "Uống sau ăn"

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
