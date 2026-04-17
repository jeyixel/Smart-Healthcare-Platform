package com.smarthealth.notification.kafka;

import com.smarthealth.notification.dto.AppointmentEventDto;
import com.smarthealth.notification.dto.EmailRequest;
import com.smarthealth.notification.dto.SmsRequest;
import com.smarthealth.notification.kafka.DLQPublisher;
import com.smarthealth.notification.service.EmailService;
import com.smarthealth.notification.service.NotificationTemplateService;
import com.smarthealth.notification.service.SmsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class KafkaAppointmentConsumer {

    private final EmailService emailService;
    private final SmsService smsService;
    private final NotificationTemplateService templateService;
    private final DLQPublisher dlqPublisher;

    @KafkaListener(topics = "appointment-created", groupId = "notification-service")
    public void handleAppointmentCreated(AppointmentEventDto event) {
        processAppointmentEvent(event, "appointment-created");
    }

    @KafkaListener(topics = "appointment-rescheduled", groupId = "notification-service")
    public void handleAppointmentRescheduled(AppointmentEventDto event) {
        processAppointmentEvent(event, "appointment-rescheduled");
    }

    @KafkaListener(topics = "appointment-status-changed", groupId = "notification-service")
    public void handleAppointmentStatusChanged(AppointmentEventDto event) {
        processAppointmentEvent(event, "appointment-status-changed");
    }

    @KafkaListener(topics = "appointment-reminder", groupId = "notification-service")
    public void handleAppointmentReminder(AppointmentEventDto event) {
        processAppointmentEvent(event, "appointment-reminder");
    }

    private void processAppointmentEvent(AppointmentEventDto event, String topic) {
        log.info("Processing {} event for appointment: {}", topic, event.getAppointmentId());
        
        // Map CANCELLED status to the correct template identifier
        if ("CANCELLED".equalsIgnoreCase(event.getStatus())) {
            event.setEventType("APPOINTMENT_CANCELLED");
        }
        
        try {
            // 1. Send Email
            if (isValidEmail(event.getPatientEmail())) {
                EmailRequest emailReq = new EmailRequest();
                emailReq.setTo(event.getPatientEmail());
                emailReq.setSubject(templateService.buildAppointmentSubject(topic, event));
                emailReq.setBody(templateService.buildAppointmentEmailBody(event));
                emailService.sendEmail(emailReq, topic);
            }

            // 2. Send SMS
            if (isValidPhone(event.getPatientPhone())) {
                SmsRequest smsReq = new SmsRequest();
                smsReq.setTo(event.getPatientPhone());
                smsReq.setMessage(templateService.buildAppointmentSmsBody(event));
                smsService.sendSms(smsReq, topic);
            }
        } catch (Exception e) {
            log.error("Exhausted retries for {}: {}. Sending to DLQ.", topic, event.getAppointmentId());
            dlqPublisher.publishToDLQ(event, topic, e.getMessage());
        }
    }

    private boolean isValidEmail(String email) {
        return email != null && !email.isBlank();
    }

    private boolean isValidPhone(String phone) {
        return phone != null && !phone.isBlank();
    }
}
