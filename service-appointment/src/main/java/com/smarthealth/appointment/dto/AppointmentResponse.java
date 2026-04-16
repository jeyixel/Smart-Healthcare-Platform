package com.smarthealth.appointment.dto;

import com.smarthealth.appointment.entity.AppointmentStatus;
import com.smarthealth.appointment.entity.ConsultationType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

import com.smarthealth.appointment.entity.PaymentStatus;

public record AppointmentResponse (
        UUID id,
        UUID patientId,
        UUID doctorId,
        LocalDate appointmentDate,
        LocalTime appointmentTime,
        ConsultationType consultationType,
        AppointmentStatus status,
        PaymentStatus paymentStatus,
        LocalDateTime paymentDeadline,
        String paymentReference,
        String reason,
        String notes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
){}