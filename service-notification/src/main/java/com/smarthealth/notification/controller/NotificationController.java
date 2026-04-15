package com.smarthealth.notification.controller;

import com.smarthealth.notification.dto.*;
import com.smarthealth.notification.entity.NotificationLog;
import com.smarthealth.notification.service.EmailService;
import com.smarthealth.notification.service.NotificationService;
import com.smarthealth.notification.service.SmsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final EmailService emailService;
    private final SmsService smsService;

    // Send a raw email
    @PostMapping("/email")
    public ResponseEntity<NotificationLog> sendEmail(@Valid @RequestBody EmailRequest request) {
        NotificationLog log = emailService.sendEmail(request);
        return ResponseEntity.ok(log);
    }

    // Send a raw SMS
    @PostMapping("/sms")
    public ResponseEntity<NotificationLog> sendSms(@Valid @RequestBody SmsRequest request) {
        NotificationLog log = smsService.sendSms(request);
        return ResponseEntity.ok(log);
    }

    // Appointment confirmation (called by appointment service)
    @PostMapping("/appointment/confirmed")
    public ResponseEntity<String> appointmentConfirmed(
            @Valid @RequestBody AppointmentNotificationRequest request) {
        notificationService.sendAppointmentConfirmation(request);
        return ResponseEntity.ok("Appointment confirmation sent");
    }

    // Appointment cancellation
    @PostMapping("/appointment/cancelled")
    public ResponseEntity<String> appointmentCancelled(
            @Valid @RequestBody AppointmentNotificationRequest request) {
        notificationService.sendAppointmentCancellation(request);
        return ResponseEntity.ok("Cancellation notification sent");
    }

    // Consultation completed
    @PostMapping("/consultation/completed")
    public ResponseEntity<String> consultationCompleted(
            @Valid @RequestBody AppointmentNotificationRequest request) {
        notificationService.sendConsultationComplete(request);
        return ResponseEntity.ok("Consultation completion notification sent");
    }

    // Get all logs (admin use)
    @GetMapping("/logs")
    public ResponseEntity<List<NotificationLog>> getAllLogs() {
        return ResponseEntity.ok(notificationService.getAllLogs());
    }

    // Get logs by recipient
    @GetMapping("/logs/{recipient}")
    public ResponseEntity<List<NotificationLog>> getLogsByRecipient(
            @PathVariable String recipient) {
        return ResponseEntity.ok(notificationService.getLogsByRecipient(recipient));
    }

    // Get failed notifications
    @GetMapping("/logs/failed")
    public ResponseEntity<List<NotificationLog>> getFailedLogs() {
        return ResponseEntity.ok(notificationService.getFailedNotifications());
    }
}