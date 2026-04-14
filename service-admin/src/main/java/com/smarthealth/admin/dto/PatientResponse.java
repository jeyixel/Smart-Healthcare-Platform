package com.smarthealth.admin.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public record PatientResponse(
        UUID id,
        String authUserId,
        String firstName,
        String lastName,
        String email,
        String phoneNumber,
        LocalDate dateOfBirth,
        String gender,
        String bloodGroup,
        String address,
        String emergencyContactName,
        String emergencyContactPhone,
        boolean active,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}
