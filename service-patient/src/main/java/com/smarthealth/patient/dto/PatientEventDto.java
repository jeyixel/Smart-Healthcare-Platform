package com.smarthealth.patient.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientEventDto {
    private Long patientId;
    private Long adminId;
    private String eventType;
    private String description;
    private String status;
    private Long timestamp;
}
