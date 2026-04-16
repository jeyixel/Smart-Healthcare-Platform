package com.smarthealth.prescription.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionEventDto {
    private String eventType;
    private String prescriptionId;
    private String appointmentId;
    private String patientId;
    private String doctorId;
    private String patientEmail;
    private String patientPhone;
    private String patientName;
    private String doctorName;
    private String doctorEmail;
    private String doctorPhone;
    private String prescriptionDate;
    private String medicationSummary;
    private String timestamp;
}
