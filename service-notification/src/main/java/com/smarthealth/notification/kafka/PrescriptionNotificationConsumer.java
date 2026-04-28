package com.smarthealth.notification.kafka;

import com.smarthealth.notification.dto.EmailRequest;
import com.smarthealth.notification.dto.PrescriptionNotificationEvent;
import com.smarthealth.notification.dto.SmsRequest;
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
public class PrescriptionNotificationConsumer {

    private final EmailService emailService;
    private final SmsService smsService;
    private final NotificationTemplateService templateService;

    @KafkaListener(
            topics = "${notification.kafka.topic.prescription:prescription.notification.events}",
            groupId = "${spring.kafka.consumer.group-id:notification-service}"
    )
    public void consume(PrescriptionNotificationEvent event) {
        String type = event.getEventType() == null ? "" : event.getEventType().trim().toUpperCase();
        if (!"PRESCRIPTION_CREATED".equals(type)) {
            log.warn("Ignoring unknown prescription notification eventType={} prescriptionId={}", event.getEventType(), event.getPrescriptionId());
            return;
        }

        sendEmail(event.getDoctorEmail(),
                templateService.prescriptionCreatedEmailSubject(event),
                templateService.prescriptionCreatedEmailBody(event),
                type);
        sendSms(event.getDoctorPhone(), templateService.prescriptionCreatedSms(event), type);
    }

    private void sendEmail(String to, String subject, String body, String eventType) {
        if (to == null || to.isBlank()) {
            log.warn("Skipping prescription email due to empty recipient for eventType={}", eventType);
            return;
        }
        EmailRequest email = new EmailRequest();
        email.setTo(to);
        email.setSubject(subject);
        email.setBody(body);
        emailService.sendEmail(email, eventType);
    }

    private void sendSms(String to, String message, String eventType) {
        if (to == null || to.isBlank()) {
            log.warn("Skipping prescription SMS due to empty recipient for eventType={}", eventType);
            return;
        }
        SmsRequest sms = new SmsRequest();
        sms.setTo(to);
        sms.setMessage(message);
        smsService.sendSms(sms, eventType);
    }
}

