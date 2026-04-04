package com.smarthealth.prescription.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record CreatePrescriptionRequest(
        @NotNull UUID appointmentId,
        @NotNull UUID patientId,
        @NotNull UUID doctorId,
        @Size(max = 500) String diagnosis,
        @Size(max = 3000) String clinicalNotes,
        boolean followUpRequired,
        LocalDate followUpDate,
        @Valid @NotEmpty List<CreatePrescriptionItemRequest> items
) {}
