package com.smarthealth.notification.kafka;

import com.smarthealth.notification.dto.EmailRequest;
import com.smarthealth.notification.dto.PrescriptionEventDto;
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
public class KafkaPrescriptionConsumer {

    private final EmailService emailService;
    private final SmsService smsService;
    private final NotificationTemplateService templateService;
    private final DLQPublisher dlqPublisher;

    @KafkaListener(topics = "prescription-created", groupId = "notification-service")
    public void handlePrescriptionCreated(PrescriptionEventDto event) {
        String topic = "prescription-created";
        log.info("Received {} event for prescription: {}", topic, event.getPrescriptionId());

        try {
            // Notify Patient
            if (isValidEmail(event.getPatientEmail())) {
                EmailRequest emailReq = new EmailRequest();
                emailReq.setTo(event.getPatientEmail());
                emailReq.setSubject(templateService.buildPrescriptionSubject(topic));
                emailReq.setBody(templateService.buildPrescriptionEmailBody(event));
                emailService.sendEmail(emailReq, topic);
            }

            if (isValidPhone(event.getPatientPhone())) {
                SmsRequest smsReq = new SmsRequest();
                smsReq.setTo(event.getPatientPhone());
                smsReq.setMessage(templateService.buildPrescriptionSmsBody(event));
                smsService.sendSms(smsReq, topic);
            }

            // Notify Doctor (Optional confirmation)
            if (isValidEmail(event.getDoctorEmail())) {
                EmailRequest docEmail = new EmailRequest();
                docEmail.setTo(event.getDoctorEmail());
                docEmail.setSubject("Prescription Successfully Issued");
                docEmail.setBody(String.format("Dear Dr. %s,\nYou have successfully issued a prescription for appointment %s.\nSummary: %s",
                        event.getDoctorName(), event.getAppointmentId(), event.getMedicationSummary()));
                emailService.sendEmail(docEmail, topic);
            }
        } catch (Exception e) {
            log.error("Exhausted retries for {}: {}. Sending to DLQ.", topic, event.getPrescriptionId());
            dlqPublisher.publishToDLQ(event, topic, e.getMessage());
        }
    }

    @KafkaListener(topics = "prescription-updated", groupId = "notification-service")
    public void handlePrescriptionUpdated(PrescriptionEventDto event) {
        String topic = "prescription-updated";
        log.info("Received {} event for prescription: {}", topic, event.getPrescriptionId());

        try {
            // Notify Patient
            if (isValidEmail(event.getPatientEmail())) {
                EmailRequest emailReq = new EmailRequest();
                emailReq.setTo(event.getPatientEmail());
                emailReq.setSubject(templateService.buildPrescriptionSubject(topic));
                emailReq.setBody(templateService.buildPrescriptionEmailBody(event));
                emailService.sendEmail(emailReq, topic);
            }

            if (isValidPhone(event.getPatientPhone())) {
                SmsRequest smsReq = new SmsRequest();
                smsReq.setTo(event.getPatientPhone());
                smsReq.setMessage(templateService.buildPrescriptionSmsBody(event));
                smsService.sendSms(smsReq, topic);
            }
            
            // Doctor notification for update
            if (isValidEmail(event.getDoctorEmail())) {
                EmailRequest docEmail = new EmailRequest();
                docEmail.setTo(event.getDoctorEmail());
                docEmail.setSubject("Prescription Successfully Updated");
                docEmail.setBody(String.format("Dear Dr. %s,\nYou have successfully updated the prescription for appointment %s.\nSummary: %s",
                        event.getDoctorName(), event.getAppointmentId(), event.getMedicationSummary()));
                emailService.sendEmail(docEmail, topic);
            }
        } catch (Exception e) {
            log.error("Exhausted retries for {}: {}. Sending to DLQ.", topic, event.getPrescriptionId());
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
