package com.smarthealth.notification.kafka;

import com.smarthealth.notification.dto.EmailRequest;
import com.smarthealth.notification.dto.PrescriptionEventDto;
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
public class KafkaPrescriptionConsumer {

    private final EmailService emailService;
    private final SmsService smsService;

    @KafkaListener(topics = "prescription-created", groupId = "notification-service")
    public void handlePrescriptionCreated(PrescriptionEventDto event) {
        log.info("Received prescription-created event for prescription: {}", event.getPrescriptionId());

        // Notify Patient
        if (isValidEmail(event.getPatientEmail())) {
            EmailRequest emailReq = new EmailRequest();
            emailReq.setTo(event.getPatientEmail());
            emailReq.setSubject("New Prescription Ready");
            emailReq.setBody(String.format("Dear %s,\n\nDr. %s has issued a new prescription for you on %s.\nSummary: %s\n\nPlease log into the Smart Healthcare Platform for full details and instructions.\n\nThank you,\nSmart Healthcare Team",
                    event.getPatientName() != null ? event.getPatientName() : "Patient", 
                    event.getDoctorName(), 
                    event.getPrescriptionDate(), 
                    event.getMedicationSummary()));
            emailService.sendEmail(emailReq);
        }

        if (isValidPhone(event.getPatientPhone())) {
            SmsRequest smsReq = new SmsRequest();
            smsReq.setTo(event.getPatientPhone());
            smsReq.setMessage(String.format("A new prescription from Dr. %s is ready. Summary: %s. Log in to view details.",
                    event.getDoctorName(), event.getMedicationSummary()));
            smsService.sendSms(smsReq);
        }

        // Notify Doctor
        if (isValidEmail(event.getDoctorEmail())) {
            EmailRequest docEmail = new EmailRequest();
            docEmail.setTo(event.getDoctorEmail());
            docEmail.setSubject("Prescription Successfully Issued");
            docEmail.setBody(String.format("Dear Dr. %s,\n\nYou have successfully issued a prescription for appointment %s.\nSummary: %s\n\nThank you,\nSmart Healthcare Team",
                    event.getDoctorName(), event.getAppointmentId(), event.getMedicationSummary()));
            emailService.sendEmail(docEmail);
        }
    }

    @KafkaListener(topics = "prescription-updated", groupId = "notification-service")
    public void handlePrescriptionUpdated(PrescriptionEventDto event) {
        log.info("Received prescription-updated event for prescription: {}", event.getPrescriptionId());

        // Notify Patient
        if (isValidEmail(event.getPatientEmail())) {
            EmailRequest emailReq = new EmailRequest();
            emailReq.setTo(event.getPatientEmail());
            emailReq.setSubject("Prescription Updated");
            emailReq.setBody(String.format("Dear %s,\n\nDr. %s has updated your prescription on %s.\nNew Summary: %s\n\nPlease log into the Smart Healthcare Platform to view the changes.\n\nThank you,\nSmart Healthcare Team",
                    event.getPatientName() != null ? event.getPatientName() : "Patient", 
                    event.getDoctorName(), 
                    event.getPrescriptionDate(), 
                    event.getMedicationSummary()));
            emailService.sendEmail(emailReq);
        }

        if (isValidPhone(event.getPatientPhone())) {
            SmsRequest smsReq = new SmsRequest();
            smsReq.setTo(event.getPatientPhone());
            smsReq.setMessage(String.format("Your prescription from Dr. %s has been updated. Summary: %s.",
                    event.getDoctorName(), event.getMedicationSummary()));
            smsService.sendSms(smsReq);
        }
        
        // Doctor notification for update is optional but good to have
        if (isValidEmail(event.getDoctorEmail())) {
            EmailRequest docEmail = new EmailRequest();
            docEmail.setTo(event.getDoctorEmail());
            docEmail.setSubject("Prescription Successfully Updated");
            docEmail.setBody(String.format("Dear Dr. %s,\n\nYou have successfully updated the prescription for appointment %s.\nSummary: %s\n\nThank you,\nSmart Healthcare Team",
                    event.getDoctorName(), event.getAppointmentId(), event.getMedicationSummary()));
            emailService.sendEmail(docEmail);
        }
    }

    private boolean isValidEmail(String email) {
        return email != null && !email.isBlank();
    }

    private boolean isValidPhone(String phone) {
        return phone != null && !phone.isBlank();
    }
}
