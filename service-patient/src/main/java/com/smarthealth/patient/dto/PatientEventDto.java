package com.smarthealth.patient.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientEventDto {
    private String patientId;
    private Long adminId;
    private String eventType;
    private String description;
    private String status;
    private Long timestamp;
}
