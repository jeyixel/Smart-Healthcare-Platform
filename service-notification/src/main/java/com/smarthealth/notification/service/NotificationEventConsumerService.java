package com.smarthealth.notification.service;

import com.smarthealth.notification.dto.EmailRequest;
import com.smarthealth.notification.dto.PatientEventDto;
import com.smarthealth.notification.dto.SmsRequest;
import com.smarthealth.notification.kafka.DLQPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationEventConsumerService {

    private final EmailService emailService;
    private final SmsService smsService;
    private final DLQPublisher dlqPublisher;

    @KafkaListener(
            topics = "${smarthealth.kafka.topics.notification-events:notification-events}",
            groupId = "${spring.kafka.consumer.group-id:service-notification-group}"
    )
    public void consumeNotificationEvent(PatientEventDto event) {
        String eventType = event.getEventType() != null ? event.getEventType() : "generic-event";
        log.info("Received notification event type={} patientId={}", eventType, event.getPatientId());

        try {
            if (event.isSendEmail() && event.getRecipientEmail() != null && !event.getRecipientEmail().isBlank()) {
                EmailRequest emailRequest = new EmailRequest();
                emailRequest.setTo(event.getRecipientEmail());
                emailRequest.setSubject(event.getSubject());
                emailRequest.setBody(event.getMessage());
                emailService.sendEmail(emailRequest, eventType);
            }

            if (event.isSendSms() && event.getRecipientPhone() != null && !event.getRecipientPhone().isBlank()) {
                SmsRequest smsRequest = new SmsRequest();
                smsRequest.setTo(event.getRecipientPhone());
                smsRequest.setMessage(event.getMessage());
                smsService.sendSms(smsRequest, eventType);
            }
        } catch (Exception e) {
            log.error("Failed to process notification event for patient {}. Sending to DLQ.", event.getPatientId());
            dlqPublisher.publishToDLQ(event, "notification-events", e.getMessage());
        }
    }
}
