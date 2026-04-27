package com.smarthealth.patient.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionResponse {
    private UUID id;
    private UUID appointmentId;
    private UUID patientId;
    private UUID doctorId;
    private String diagnosis;
    private String clinicalNotes;
    private String status;
    private boolean followUpRequired;
    private Instant followUpDate;
    private Instant issuedAt;
    private List<PrescriptionItemResponse> items;
    private Instant createdAt;
    private Instant updatedAt;
}
