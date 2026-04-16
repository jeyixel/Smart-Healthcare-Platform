package com.smarthealth.notification.kafka;

import com.smarthealth.notification.dto.AppointmentEventDto;
import com.smarthealth.notification.dto.EmailRequest;
import com.smarthealth.notification.dto.SmsRequest;
import com.smarthealth.notification.service.EmailService;
import com.smarthealth.notification.service.SmsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Objects;

@Component
@RequiredArgsConstructor
@Slf4j
public class KafkaAppointmentConsumer {

    private final EmailService emailService;
    private final SmsService smsService;

    @KafkaListener(topics = "appointment-created", groupId = "notification-service")
    public void handleAppointmentCreated(AppointmentEventDto event) {
        log.info("Received appointment-created event for appointment: {}", event.getAppointmentId());

        // Notify Patient
        if (isValidEmail(event.getPatientEmail())) {
            EmailRequest emailReq = new EmailRequest();
            emailReq.setTo(event.getPatientEmail());
            emailReq.setSubject("Appointment Confirmation");
            emailReq.setBody(String.format("Dear %s,\n\nYour appointment with Dr. %s is unconfirmed and pending. \nDate: %s\nTime: %s\nType: %s\n\nThank you,\nSmart Healthcare Team",
                    event.getPatientName(), event.getDoctorName(), event.getAppointmentDate(), event.getAppointmentTime(), event.getConsultationType()));
            emailService.sendEmail(emailReq);
        }

        if (isValidPhone(event.getPatientPhone())) {
            SmsRequest smsReq = new SmsRequest();
            smsReq.setTo(event.getPatientPhone());
            smsReq.setMessage(String.format("Your appointment with Dr. %s on %s at %s is pending confirmation.",
                    event.getDoctorName(), event.getAppointmentDate(), event.getAppointmentTime()));
            smsService.sendSms(smsReq);
        }

        // Notify Doctor
        if (isValidEmail(event.getDoctorEmail())) {
            EmailRequest docEmail = new EmailRequest();
            docEmail.setTo(event.getDoctorEmail());
            docEmail.setSubject("New Appointment Booked");
            docEmail.setBody(String.format("Dear Dr. %s,\n\nA new appointment has been booked by %s.\nDate: %s\nTime: %s\nType: %s\n\nPlease check your portal to confirm or manage it.\n\nThank you,\nSmart Healthcare Team",
                    event.getDoctorName(), event.getPatientName(), event.getAppointmentDate(), event.getAppointmentTime(), event.getConsultationType()));
            emailService.sendEmail(docEmail);
        }
    }

    @KafkaListener(topics = "appointment-rescheduled", groupId = "notification-service")
    public void handleAppointmentRescheduled(AppointmentEventDto event) {
        log.info("Received appointment-rescheduled event for appointment: {}", event.getAppointmentId());

        if (isValidEmail(event.getPatientEmail())) {
            EmailRequest emailReq = new EmailRequest();
            emailReq.setTo(event.getPatientEmail());
            emailReq.setSubject("Appointment Rescheduled");
            emailReq.setBody(String.format("Dear %s,\n\nYour appointment with Dr. %s has been rescheduled.\nNew Date: %s\nNew Time: %s\nType: %s\n\nThank you,\nSmart Healthcare Team",
                    event.getPatientName(), event.getDoctorName(), event.getAppointmentDate(), event.getAppointmentTime(), event.getConsultationType()));
            emailService.sendEmail(emailReq);
        }

        if (isValidPhone(event.getPatientPhone())) {
            SmsRequest smsReq = new SmsRequest();
            smsReq.setTo(event.getPatientPhone());
            smsReq.setMessage(String.format("Your appointment with Dr. %s is rescheduled to %s at %s.",
                    event.getDoctorName(), event.getAppointmentDate(), event.getAppointmentTime()));
            smsService.sendSms(smsReq);
        }
    }

    @KafkaListener(topics = "appointment-status-changed", groupId = "notification-service")
    public void handleAppointmentStatusChanged(AppointmentEventDto event) {
        log.info("Received appointment-status-changed event for appointment: {}", event.getAppointmentId());
        
        String status = event.getStatus();

        // Notify Patient
        if (isValidEmail(event.getPatientEmail())) {
            EmailRequest emailReq = new EmailRequest();
            emailReq.setTo(event.getPatientEmail());
            emailReq.setSubject("Appointment Status Update: " + status);
            emailReq.setBody(String.format("Dear %s,\n\nThe status of your appointment with Dr. %s on %s at %s has been updated to: %s.\n\nThank you,\nSmart Healthcare Team",
                    event.getPatientName(), event.getDoctorName(), event.getAppointmentDate(), event.getAppointmentTime(), status));
            emailService.sendEmail(emailReq);
        }

        if (isValidPhone(event.getPatientPhone())) {
            SmsRequest smsReq = new SmsRequest();
            smsReq.setTo(event.getPatientPhone());
            smsReq.setMessage(String.format("Status of your appointment with Dr. %s on %s is now: %s.",
                    event.getDoctorName(), event.getAppointmentDate(), status));
            smsService.sendSms(smsReq);
        }

        // Notify Doctor on Cancellation or Completion
        if (("CANCELLED".equalsIgnoreCase(status) || "COMPLETED".equalsIgnoreCase(status)) && isValidEmail(event.getDoctorEmail())) {
            EmailRequest docEmail = new EmailRequest();
            docEmail.setTo(event.getDoctorEmail());
            docEmail.setSubject("Appointment Status Update: " + status);
            docEmail.setBody(String.format("Dear Dr. %s,\n\nThe appointment with %s on %s at %s has been %s.\n\nThank you,\nSmart Healthcare Team",
                    event.getDoctorName(), event.getPatientName(), event.getAppointmentDate(), event.getAppointmentTime(), status));
            emailService.sendEmail(docEmail);
        }
    }

    @KafkaListener(topics = "appointment-reminder", groupId = "notification-service")
    public void handleAppointmentReminder(AppointmentEventDto event) {
        log.info("Received appointment-reminder event for appointment: {}", event.getAppointmentId());

        if (isValidEmail(event.getPatientEmail())) {
            EmailRequest emailReq = new EmailRequest();
            emailReq.setTo(event.getPatientEmail());
            emailReq.setSubject("Appointment Reminder");
            emailReq.setBody(String.format("Dear %s,\n\nThis is a friendly reminder for your upcoming appointment with Dr. %s.\nDate: %s\nTime: %s\nType: %s\n\nThank you,\nSmart Healthcare Team",
                    event.getPatientName(), event.getDoctorName(), event.getAppointmentDate(), event.getAppointmentTime(), event.getConsultationType()));
            emailService.sendEmail(emailReq);
        }

        if (isValidPhone(event.getPatientPhone())) {
            SmsRequest smsReq = new SmsRequest();
            smsReq.setTo(event.getPatientPhone());
            smsReq.setMessage(String.format("Reminder: Appointment with Dr. %s on %s at %s.",
                    event.getDoctorName(), event.getAppointmentDate(), event.getAppointmentTime()));
            smsService.sendSms(smsReq);
        }
    }

    private boolean isValidEmail(String email) {
        return email != null && !email.isBlank();
    }

    private boolean isValidPhone(String phone) {
        return phone != null && !phone.isBlank();
    }
}
