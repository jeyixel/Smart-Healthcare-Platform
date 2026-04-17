package com.smarthealth.doctor.dto;

import com.smarthealth.doctor.entity.DayOfWeekType;
import com.smarthealth.doctor.entity.DoctorAvailabilityStatus;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

public record DoctorAvailabilityRequest(
        @NotNull DayOfWeekType dayOfWeek,
        @NotNull LocalTime startTime,
        @NotNull LocalTime endTime,
        @NotNull DoctorAvailabilityStatus status
) {}
