package com.clinic.entity;

import com.clinic.entity.enums.DosageForm;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Medicine entity - catalog of medicines.
 */
@Entity
@Table(name = "medicines", indexes = {
        @Index(name = "idx_medicines_name", columnList = "name")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medicine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "generic_name", length = 200)
    private String genericName;

    @Enumerated(EnumType.STRING)
    @Column(name = "dosage_form", length = 50)
    private DosageForm dosageForm;

    @Column(name = "strength", length = 50)
    private String strength; // 500mg, 250mg/5ml

    @Column(name = "manufacturer", length = 200)
    private String manufacturer;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "side_effects", columnDefinition = "TEXT")
    private String sideEffects;

    @Column(name = "contraindications", columnDefinition = "TEXT")
    private String contraindications; // Chống chỉ định

    @Column(name = "is_prescription")
    @Builder.Default
    private Boolean isPrescription = true; // Cần đơn thuốc?

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
