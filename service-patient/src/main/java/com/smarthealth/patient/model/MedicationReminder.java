package com.smarthealth.patient.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "medication_reminders")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicationReminder {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false)
    private UUID patientId;

    @Column(nullable = false)
    private UUID prescriptionId;

    @Column(nullable = false)
    private String medicineName;

    private String dosage;
    private String frequency;
    private String duration;
    private String instructions;

    @Column(nullable = false)
    private Instant startDate;

    private Instant endDate;

    @Column(nullable = false)
    private String status; // ACTIVE, COMPLETED, CANCELLED
}
