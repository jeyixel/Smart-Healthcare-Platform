package com.smarthealth.appointment.dto;

import com.smarthealth.appointment.entity.AppointmentStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateAppointmentStatusRequest (
        @NotNull AppointmentStatus status,
        @Size(max = 1000) String notes
){}
