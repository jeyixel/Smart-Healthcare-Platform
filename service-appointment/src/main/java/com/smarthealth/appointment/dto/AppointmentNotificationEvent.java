package com.smarthealth.appointment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentNotificationEvent {
    private String eventType; // APPOINTMENT_BOOKED | APPOINTMENT_CANCELLED
    private String appointmentId;
    private String patientId;
    private String patientName;
    private String patientEmail;
    private String patientPhone;
    private String doctorName;
    private String specialty;
    private String appointmentDateTime;
    private String mode;
}

