package com.smarthealth.notification.kafka;

import com.smarthealth.notification.dto.EmailRequest;
import com.smarthealth.notification.dto.PaymentEventDto;
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
public class KafkaNotificationConsumer {

    private final EmailService emailService;
    private final SmsService smsService;
    private final NotificationTemplateService templateService;
    private final DLQPublisher dlqPublisher;

    @KafkaListener(topics = "payment-success", groupId = "notification-service")
    public void handlePaymentSuccess(PaymentEventDto event) {
        String topic = "payment-success";
        log.info("Received {} event for order: {}", topic, event.getOrderId());

        try {
            // 1. Send Booking Confirmation Email
            EmailRequest confirmEmail = new EmailRequest();
            confirmEmail.setTo(event.getPatientEmail());
            confirmEmail.setSubject(templateService.buildPaymentSubject(topic));
            confirmEmail.setBody(templateService.buildPaymentEmailBody(event));
            emailService.sendEmail(confirmEmail, topic);

            // 2. Send Receipt Email
            EmailRequest receiptEmail = new EmailRequest();
            receiptEmail.setTo(event.getPatientEmail());
            receiptEmail.setSubject("Payment Receipt - " + event.getTransactionId());
            receiptEmail.setBody(templateService.buildPaymentReceiptBody(event));
            emailService.sendEmail(receiptEmail, topic);

            // 3. Send SMS
            if (isValidPhone(event.getPatientPhone())) {
                SmsRequest smsReq = new SmsRequest();
                smsReq.setTo(event.getPatientPhone());
                smsReq.setMessage(templateService.buildPaymentSmsBody(event));
                smsService.sendSms(smsReq, topic);
            }
        } catch (Exception e) {
            log.error("Exhausted retries for {}: {}. Sending to DLQ.", topic, event.getOrderId());
            dlqPublisher.publishToDLQ(event, topic, e.getMessage());
        }
    }

    @KafkaListener(topics = "payment-failed", groupId = "notification-service")
    public void handlePaymentFailed(PaymentEventDto event) {
        String topic = "payment-failed";
        log.info("Received {} event for order: {}", topic, event.getOrderId());

        try {
            // 1. Send Payment Failed Email
            EmailRequest failEmail = new EmailRequest();
            failEmail.setTo(event.getPatientEmail());
            failEmail.setSubject(templateService.buildPaymentSubject(topic));
            failEmail.setBody(templateService.buildPaymentEmailBody(event));
            emailService.sendEmail(failEmail, topic);

            // 2. Send SMS
            if (isValidPhone(event.getPatientPhone())) {
                SmsRequest smsReq = new SmsRequest();
                smsReq.setTo(event.getPatientPhone());
                smsReq.setMessage(templateService.buildPaymentSmsBody(event));
                smsService.sendSms(smsReq, topic);
            }
        } catch (Exception e) {
            log.error("Exhausted retries for {}: {}. Sending to DLQ.", topic, event.getOrderId());
            dlqPublisher.publishToDLQ(event, topic, e.getMessage());
        }
    }

    private boolean isValidPhone(String phone) {
        return phone != null && !phone.isBlank();
    }
}
