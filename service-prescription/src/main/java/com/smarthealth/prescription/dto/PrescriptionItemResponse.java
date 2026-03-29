package com.smarthealth.prescription.dto;

import java.util.UUID;

public record PrescriptionItemResponse(
        UUID id,
        String medicineName,
        String dosage,
        String frequency,
        String duration,
        String instructions,
        String quantity
) {}
