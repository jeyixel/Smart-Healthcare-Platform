package com.smarthealth.notification.kafka;

import com.smarthealth.notification.dto.EmailRequest;
import com.smarthealth.notification.dto.PaymentEventDto;
import com.smarthealth.notification.dto.SmsRequest;
import com.smarthealth.notification.service.EmailService;
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

    @KafkaListener(topics = "payment-success", groupId = "notification-service")
    public void handlePaymentSuccess(PaymentEventDto event) {
        log.info("Received payment-success event for order: {}", event.getOrderId());

        // Send Email
        EmailRequest emailReq = new EmailRequest();
        emailReq.setTo(event.getPatientEmail());
        emailReq.setSubject("Payment Successful - " + event.getItemDescription());
        emailReq.setBody(String.format("Dear %s %s,\n\nYour payment of %s %s for %s has been successfully processed.\n\nThank you,\nSmart Healthcare Team",
                event.getPatientFirstName(), event.getPatientLastName(), event.getAmount(), event.getCurrency(), event.getItemDescription()));
        emailService.sendEmail(emailReq);

        // Send SMS
        if (event.getPatientPhone() != null && !event.getPatientPhone().isBlank()) {
            SmsRequest smsReq = new SmsRequest();
            smsReq.setTo(event.getPatientPhone());
            smsReq.setMessage(String.format("Payment of %s %s successful for %s. - Smart Healthcare",
                    event.getAmount(), event.getCurrency(), event.getItemDescription()));
            smsService.sendSms(smsReq);
        }
    }

    @KafkaListener(topics = "payment-failed", groupId = "notification-service")
    public void handlePaymentFailed(PaymentEventDto event) {
        log.info("Received payment-failed event for order: {}", event.getOrderId());

        // Send Email
        EmailRequest emailReq = new EmailRequest();
        emailReq.setTo(event.getPatientEmail());
        emailReq.setSubject("Payment Failed - " + event.getItemDescription());
        emailReq.setBody(String.format("Dear %s %s,\n\nUnfortunately, your payment of %s %s for %s has failed. Please try again.\n\nThank you,\nSmart Healthcare Team",
                event.getPatientFirstName(), event.getPatientLastName(), event.getAmount(), event.getCurrency(), event.getItemDescription()));
        emailService.sendEmail(emailReq);

        // Send SMS
        if (event.getPatientPhone() != null && !event.getPatientPhone().isBlank()) {
            SmsRequest smsReq = new SmsRequest();
            smsReq.setTo(event.getPatientPhone());
            smsReq.setMessage(String.format("Payment of %s %s failed for %s. Please try again. - Smart Healthcare",
                    event.getAmount(), event.getCurrency(), event.getItemDescription()));
            smsService.sendSms(smsReq);
        }
    }
}
