package com.smarthealth.prescription.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreatePrescriptionItemRequest(
        @NotBlank @Size(max = 200) String medicineName,
        @NotBlank @Size(max = 100) String dosage,
        @NotBlank @Size(max = 100) String frequency,
        @NotBlank @Size(max = 100) String duration,
        @Size(max = 1000) String instructions,
        @Size(max = 100) String quantity
) {}
