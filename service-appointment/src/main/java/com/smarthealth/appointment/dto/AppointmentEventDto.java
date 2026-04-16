package com.smarthealth.appointment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentEventDto {
    private String eventType;
    private String appointmentId;
    private String patientId;
    private String doctorId;
    private String patientEmail;
    private String patientPhone;
    private String patientName;
    private String doctorName;
    private String doctorEmail;
    private String doctorPhone;
    private String appointmentDate;
    private String appointmentTime;
    private String consultationType;
    private String status;
    private String timestamp;
}
