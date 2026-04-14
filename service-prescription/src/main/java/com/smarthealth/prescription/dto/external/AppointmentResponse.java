package com.smarthealth.prescription.dto.external;

import com.smarthealth.prescription.entity.AppointmentStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

public record AppointmentResponse(
        UUID id,
        UUID patientId,
        UUID doctorId,
        LocalDate appointmentDate,
        LocalTime appointmentTime,
        AppointmentStatus status,
        String reason,
        String notes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
