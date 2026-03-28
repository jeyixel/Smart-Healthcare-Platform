package com.smarthealth.appointment.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "appointments")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private UUID patientId;

    @Column(nullable = false)
    private UUID doctorId;

    @Column(nullable = false)
    private LocalDate appointmentDate;

    @Column(nullable = false)
    private LocalTime appointmentTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ConsultationType consultationType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AppointmentStatus status;

    @Column(length = 500)
    private String reason;

    @Column(length = 1000)
    private String notes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.status == null) {
            this.status = AppointmentStatus.PENDING;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
