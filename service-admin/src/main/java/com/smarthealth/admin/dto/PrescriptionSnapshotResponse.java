package com.smarthealth.admin.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public record PrescriptionSnapshotResponse(
        UUID id,
        UUID patientId,
        String externalPrescriptionId,
        String doctorId,
        String medicationSummary,
        LocalDate issuedDate,
        String status,
        OffsetDateTime syncedAt
) {
}
