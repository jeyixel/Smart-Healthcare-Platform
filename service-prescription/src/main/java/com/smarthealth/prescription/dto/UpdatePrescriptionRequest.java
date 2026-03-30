package com.smarthealth.prescription.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record UpdatePrescriptionRequest(
        @Size(max = 500) String diagnosis,
        @Size(max = 3000) String clinicalNotes,
        Boolean followUpRequired,
        LocalDate followUpDate,
        @Valid List<CreatePrescriptionItemRequest> items
) {}
