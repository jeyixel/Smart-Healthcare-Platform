package com.smarthealth.admin.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientEventDto {
    private String patientId;
    private Long adminId;
    private String eventType; // CREATED, UPDATED, DELETED, VERIFIED, etc.
    private String description;
    private String status; // PENDING, COMPLETED, FAILED
    private Long timestamp;
}
