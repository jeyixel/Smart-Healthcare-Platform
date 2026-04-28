package com.smarthealth.notification.kafka;

import com.smarthealth.notification.dto.AppointmentNotificationEvent;
import com.smarthealth.notification.dto.EmailRequest;
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
public class AppointmentNotificationConsumer {

    private final EmailService emailService;
    private final SmsService smsService;
    private final NotificationTemplateService templateService;

    @KafkaListener(
            topics = "${notification.kafka.topic.appointment:appointment.notification.events}",
            groupId = "${spring.kafka.consumer.group-id:notification-service}"
    )
    public void consume(AppointmentNotificationEvent event) {
        String type = event.getEventType() == null ? "" : event.getEventType().trim().toUpperCase();

        switch (type) {
            case "APPOINTMENT_BOOKED" -> {
                sendEmail(event.getPatientEmail(),
                        templateService.appointmentBookedEmailSubject(event),
                        templateService.appointmentBookedEmailBody(event),
                        type);
                sendSms(event.getPatientPhone(), templateService.appointmentBookedSms(event), type);
            }
            case "APPOINTMENT_CANCELLED" -> {
                sendEmail(event.getPatientEmail(),
                        templateService.appointmentCancelledEmailSubject(event),
                        templateService.appointmentCancelledEmailBody(event),
                        type);
                sendSms(event.getPatientPhone(), templateService.appointmentCancelledSms(event), type);
            }
            default -> log.warn("Ignoring unknown appointment notification eventType={} appointmentId={}", event.getEventType(), event.getAppointmentId());
        }
    }

    private void sendEmail(String to, String subject, String body, String eventType) {
        if (to == null || to.isBlank()) {
            log.warn("Skipping appointment email due to empty recipient for eventType={}", eventType);
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
            log.warn("Skipping appointment SMS due to empty recipient for eventType={}", eventType);
            return;
        }
        SmsRequest sms = new SmsRequest();
        sms.setTo(to);
        sms.setMessage(message);
        smsService.sendSms(sms, eventType);
    }
}

