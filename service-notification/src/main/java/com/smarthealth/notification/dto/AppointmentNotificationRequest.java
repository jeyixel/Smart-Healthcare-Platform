package com.smarthealth.notification.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AppointmentNotificationRequest {

    @NotBlank
    @Email
    private String patientEmail;

    private String patientPhone;   // optional, for SMS

    @NotBlank
    private String patientName;

    @NotBlank
    private String doctorName;

    @NotBlank
    private String appointmentDate;

    @NotBlank
    private String appointmentTime;

    private String specialization;
}