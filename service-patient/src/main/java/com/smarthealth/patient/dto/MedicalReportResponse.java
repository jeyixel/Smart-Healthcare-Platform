package com.smarthealth.patient.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record MedicalReportResponse(
        UUID id,
        UUID patientId,
        String reportType,
        String title,
        String storageKey,
        String fileName,
        String mimeType,
        long fileSize,
        String checksum,
        String uploadedByRole,
        OffsetDateTime uploadedAt
) {
}
