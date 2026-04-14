package com.smarthealth.doctor.dto;

import com.smarthealth.doctor.entity.DayOfWeekType;
import com.smarthealth.doctor.entity.DoctorAvailabilityStatus;

import java.time.LocalTime;
import java.util.UUID;

public record DoctorAvailabilityResponse(
        UUID id,
        DayOfWeekType dayOfWeek,
        LocalTime startTime,
        LocalTime endTime,
        DoctorAvailabilityStatus status
) {}
