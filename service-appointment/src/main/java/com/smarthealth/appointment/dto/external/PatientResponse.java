package com.smarthealth.appointment.dto.external;

import java.time.OffsetDateTime;
import java.util.UUID;

public record PatientResponse(
        UUID id,
        String authUserId,
        String firstName,
        String lastName,
        String email,
        String phoneNumber,
        Boolean active,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}
