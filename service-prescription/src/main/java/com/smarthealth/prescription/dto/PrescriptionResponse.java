package com.smarthealth.prescription.dto;

import com.smarthealth.prescription.entity.PrescriptionStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record PrescriptionResponse(
        UUID id,
        UUID appointmentId,
        UUID patientId,
        UUID doctorId,
        String diagnosis,
        String clinicalNotes,
        PrescriptionStatus status,
        boolean followUpRequired,
        LocalDate followUpDate,
        Instant issuedAt,
        List<PrescriptionItemResponse> items,
        Instant createdAt,
        Instant updatedAt
) {}
