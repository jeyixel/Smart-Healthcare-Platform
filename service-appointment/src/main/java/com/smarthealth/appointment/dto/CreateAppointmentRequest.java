package com.smarthealth.appointment.dto;

import com.smarthealth.appointment.entity.ConsultationType;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record CreateAppointmentRequest (
    @NotNull
    UUID patientId,
    @NotNull
    UUID doctorId,
    @NotNull @FutureOrPresent
    LocalDate appointmentDate,
    @NotNull
    LocalTime appointmentTime,
    @NotNull
    ConsultationType consultationType,
    @Size(max = 500)
    String reason
){}
