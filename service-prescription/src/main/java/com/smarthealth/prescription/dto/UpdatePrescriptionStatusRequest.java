package com.smarthealth.prescription.dto;

import com.smarthealth.prescription.entity.PrescriptionStatus;
import jakarta.validation.constraints.NotNull;

public record UpdatePrescriptionStatusRequest(
        @NotNull PrescriptionStatus status
) {}
