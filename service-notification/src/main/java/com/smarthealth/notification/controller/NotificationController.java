package com.smarthealth.notification.controller;

import com.smarthealth.notification.dto.AppointmentNotificationRequest;
import com.smarthealth.notification.dto.EmailRequest;
import com.smarthealth.notification.dto.SmsRequest;
import com.smarthealth.notification.entity.NotificationLog;
import com.smarthealth.notification.service.EmailService;
import com.smarthealth.notification.service.NotificationService;
import com.smarthealth.notification.service.SmsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final EmailService emailService;
    private final SmsService smsService;

    // Send a raw email
    @PostMapping("/email")
    public ResponseEntity<Void> sendEmail(@Valid @RequestBody EmailRequest request) {
        emailService.sendEmail(request, "manual-email");
        return ResponseEntity.ok().build();
    }

    // Send a raw SMS
    @PostMapping("/sms")
    public ResponseEntity<Void> sendSms(@Valid @RequestBody SmsRequest request) {
        smsService.sendSms(request, "manual-sms");
        return ResponseEntity.ok().build();
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

    // Get all logs (admin use) - Paginated & Secured
    @GetMapping("/logs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<NotificationLog>> getAllLogs(
            @PageableDefault(size = 20, sort = "sentAt") Pageable pageable) {
        return ResponseEntity.ok(notificationService.getAllLogsPaginated(pageable));
    }

    // Get logs for the currently authenticated patient (reads email from JWT)
    @GetMapping("/logs/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NotificationLog>> getMyLogs(
            java.security.Principal principal) {
        String email = principal.getName();
        return ResponseEntity.ok(notificationService.getLogsByRecipient(email));
    }

    // Get logs by recipient (admin only)
    @GetMapping("/logs/{recipient:.+}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<NotificationLog>> getLogsByRecipient(
            @PathVariable("recipient") String recipient) {
        return ResponseEntity.ok(notificationService.getLogsByRecipient(recipient));
    }

    // Get failed notifications
    @GetMapping("/logs/failed")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<NotificationLog>> getFailedLogs() {
        return ResponseEntity.ok(notificationService.getFailedNotifications());
    }
}