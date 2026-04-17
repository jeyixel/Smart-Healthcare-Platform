package com.smarthealth.appointment.dto.external;


import java.time.Instant;
import java.util.UUID;

public record DoctorResponse(
        UUID id,
        Long userId,
        String fullName,
        String email,
        String phone,
        String specialty,
        String category,
        String qualification,
        Integer experienceYears,
        String hospitalOrClinic,
        String consultationMode,
        boolean verified,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {}