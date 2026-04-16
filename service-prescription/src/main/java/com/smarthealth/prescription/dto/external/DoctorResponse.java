package com.smarthealth.prescription.dto.external;

import java.time.Instant;
import java.util.UUID;

// Doctor response DTO with Long userId for proper authorization

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
        Boolean active,
        Instant createdAt,
        Instant updatedAt
) {}
