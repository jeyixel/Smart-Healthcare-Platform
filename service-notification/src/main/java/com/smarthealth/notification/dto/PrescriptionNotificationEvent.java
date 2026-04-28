package com.smarthealth.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionNotificationEvent {
    private String eventType;
    private String prescriptionId;
    private String patientName;
    private String doctorId;
    private String doctorName;
    private String doctorEmail;
    private String doctorPhone;
    private String issuedDate;
}

