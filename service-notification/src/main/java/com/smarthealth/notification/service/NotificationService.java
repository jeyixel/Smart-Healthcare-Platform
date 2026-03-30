package com.smarthealth.notification.service;

import com.smarthealth.notification.dto.*;
import com.smarthealth.notification.entity.NotificationLog;
import com.smarthealth.notification.enums.NotificationStatus;
import com.smarthealth.notification.repository.NotificationLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final EmailService emailService;
    private final SmsService smsService;
    private final NotificationLogRepository logRepository;

    // Send appointment confirmation to patient (email + optional SMS)
    public void sendAppointmentConfirmation(AppointmentNotificationRequest request) {
        String subject = "Appointment Confirmed – Smart Healthcare";
        String body = buildAppointmentEmailBody(request);

        EmailRequest emailRequest = new EmailRequest();
        emailRequest.setTo(request.getPatientEmail());
        emailRequest.setSubject(subject);
        emailRequest.setBody(body);
        emailService.sendEmail(emailRequest);

        if (request.getPatientPhone() != null && !request.getPatientPhone().isBlank()) {
            String smsBody = "Hi " + request.getPatientName() + ", your appointment with Dr. "
                    + request.getDoctorName() + " is confirmed on "
                    + request.getAppointmentDate() + " at " + request.getAppointmentTime()
                    + ". – Smart Healthcare";

            SmsRequest smsRequest = new SmsRequest();
            smsRequest.setTo(request.getPatientPhone());
            smsRequest.setMessage(smsBody);
            smsService.sendSms(smsRequest);
        }
    }

    // Send appointment cancellation notice
    public void sendAppointmentCancellation(AppointmentNotificationRequest request) {
        String subject = "Appointment Cancelled – Smart Healthcare";
        String body = "Dear " + request.getPatientName() + ",\n\n"
                + "Your appointment with Dr. " + request.getDoctorName()
                + " scheduled on " + request.getAppointmentDate()
                + " at " + request.getAppointmentTime()
                + " has been cancelled.\n\n"
                + "Please rebook at your convenience.\n\n"
                + "Regards,\nSmart Healthcare Team";

        EmailRequest emailRequest = new EmailRequest();
        emailRequest.setTo(request.getPatientEmail());
        emailRequest.setSubject(subject);
        emailRequest.setBody(body);
        emailService.sendEmail(emailRequest);
    }

    // Send consultation completion notice
    public void sendConsultationComplete(AppointmentNotificationRequest request) {
        String subject = "Consultation Completed – Smart Healthcare";
        String body = "Dear " + request.getPatientName() + ",\n\n"
                + "Your video consultation with Dr. " + request.getDoctorName()
                + " has been completed.\n\n"
                + "Your prescription and notes have been saved in your profile.\n\n"
                + "Regards,\nSmart Healthcare Team";

        EmailRequest emailRequest = new EmailRequest();
        emailRequest.setTo(request.getPatientEmail());
        emailRequest.setSubject(subject);
        emailRequest.setBody(body);
        emailService.sendEmail(emailRequest);
    }

    public List<NotificationLog> getAllLogs() {
        return logRepository.findAll();
    }

    public List<NotificationLog> getLogsByRecipient(String recipient) {
        return logRepository.findByRecipient(recipient);
    }

    public List<NotificationLog> getFailedNotifications() {
        return logRepository.findByStatus(NotificationStatus.FAILED);
    }

    private String buildAppointmentEmailBody(AppointmentNotificationRequest request) {
        return "Dear " + request.getPatientName() + ",\n\n"
                + "Your appointment has been successfully booked!\n\n"
                + "Appointment Details:\n"
                + "-------------------\n"
                + "Doctor     : Dr. " + request.getDoctorName() + "\n"
                + "Specialization : " + request.getSpecialization() + "\n"
                + "Date       : " + request.getAppointmentDate() + "\n"
                + "Time       : " + request.getAppointmentTime() + "\n\n"
                + "Please be available 5 minutes before your appointment time.\n\n"
                + "Regards,\nSmart Healthcare Team";
    }
}