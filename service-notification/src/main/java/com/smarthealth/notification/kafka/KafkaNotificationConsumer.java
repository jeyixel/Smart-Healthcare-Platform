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

        // 1. Send Booking Confirmation Email
        EmailRequest confirmEmail = new EmailRequest();
        confirmEmail.setTo(event.getPatientEmail());
        confirmEmail.setSubject("Booking Confirmed - Smart Healthcare Platform");
        confirmEmail.setBody(String.format(
            "Dear %s,\n\n" +
            "Your appointment with Dr. %s on %s has been successfully confirmed.\n" +
            "Payment of %s %s was received successfully.\n\n" +
            "Transaction ID: %s\n" +
            "Description: %s\n\n" +
            "Thank you for choosing Smart Healthcare Platform.\n" +
            "Stay Healthy!",
            event.getPatientName(), event.getDoctorName(), event.getAppointmentDate(),
            event.getAmount(), event.getCurrency(), event.getTransactionId(), event.getItemDescription()
        ));
        emailService.sendEmail(confirmEmail);

        // 2. Send Receipt-style Email
        EmailRequest receiptEmail = new EmailRequest();
        receiptEmail.setTo(event.getPatientEmail());
        receiptEmail.setSubject("Payment Receipt - " + event.getTransactionId());
        receiptEmail.setBody(String.format(
            "--- PAYMENT RECEIPT ---\n\n" +
            "Order ID: %s\n" +
            "Transaction ID: %s\n" +
            "Patient Name: %s\n" +
            "Doctor: Dr. %s\n" +
            "Date: %s\n" +
            "Amount Paid: %s %s\n" +
            "Status: COMPLETED\n\n" +
            "Thank you for your payment.",
            event.getOrderId(), event.getTransactionId(), event.getPatientName(),
            event.getDoctorName(), event.getAppointmentDate(), event.getAmount(), event.getCurrency()
        ));
        emailService.sendEmail(receiptEmail);

        // 3. Send SMS
        if (event.getPatientPhone() != null && !event.getPatientPhone().isBlank()) {
            SmsRequest smsReq = new SmsRequest();
            smsReq.setTo(event.getPatientPhone());
            smsReq.setMessage(String.format(
                "Confirmed! Payment of %s %s successful for Dr. %s on %s. TransID: %s.",
                event.getAmount(), event.getCurrency(), event.getDoctorName(), 
                event.getAppointmentDate(), event.getTransactionId()
            ));
            smsService.sendSms(smsReq);
        }
    }

    @KafkaListener(topics = "payment-failed", groupId = "notification-service")
    public void handlePaymentFailed(PaymentEventDto event) {
        log.info("Received payment-failed event for order: {}", event.getOrderId());

        // 1. Send Payment Failed Email
        EmailRequest failEmail = new EmailRequest();
        failEmail.setTo(event.getPatientEmail());
        failEmail.setSubject("Action Required: Payment Failed");
        failEmail.setBody(String.format(
            "Dear %s,\n\n" +
            "Unfortunately, your payment of %s %s for your appointment with Dr. %s on %s was unsuccessful.\n\n" +
            "To confirm your booking, please try the payment again through the patient portal.\n\n" +
            "Order Reference: %s\n" +
            "Item: %s\n\n" +
            "Thank you,\nSmart Healthcare Team",
            event.getPatientName(), event.getAmount(), event.getCurrency(), 
            event.getDoctorName(), event.getAppointmentDate(), event.getOrderId(), event.getItemDescription()
        ));
        emailService.sendEmail(failEmail);

        // 2. Send SMS
        if (event.getPatientPhone() != null && !event.getPatientPhone().isBlank()) {
            SmsRequest smsReq = new SmsRequest();
            smsReq.setTo(event.getPatientPhone());
            smsReq.setMessage(String.format(
                "Payment failed: Your payment of %s %s for Dr. %s on %s was not successful. Please retry.",
                event.getAmount(), event.getCurrency(), event.getDoctorName(), event.getAppointmentDate()
            ));
            smsService.sendSms(smsReq);
        }
    }
}
