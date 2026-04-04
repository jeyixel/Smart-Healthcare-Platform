package com.smarthealth.patient.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public record MedicalHistoryResponse(
        UUID id,
        UUID patientId,
        String conditionName,
        LocalDate diagnosisDate,
        String source,
        String notes,
        OffsetDateTime createdAt
) {
}
