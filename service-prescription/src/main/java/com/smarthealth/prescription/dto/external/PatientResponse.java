package com.smarthealth.prescription.dto.external;

import java.time.OffsetDateTime;
import java.util.UUID;

public record PatientResponse(
        UUID id,
        String authUserId,
        String firstName,
        String lastName,
        String email,
        String phoneNumber,
        boolean active,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}
