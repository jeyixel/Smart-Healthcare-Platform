package com.smarthealth.patient.service;

import com.smarthealth.patient.dto.NotificationEventDto;
import com.smarthealth.patient.model.Patient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class NotificationEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${smarthealth.kafka.topics.notification-events:notification-events}")
    private String notificationEventsTopic;

    public NotificationEventPublisher(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishPatientCreated(Patient patient) {
        NotificationEventDto event = new NotificationEventDto();
        event.setEventType("PATIENT_CREATED");
        event.setPatientId(patient.getId().toString());
        event.setRecipientEmail(patient.getEmail());
        event.setRecipientPhone(patient.getPhoneNumber());
        event.setSubject("Welcome to Smart Healthcare");
        event.setMessage("Hi " + safeName(patient) + ", your patient account is now active in Smart Healthcare.");
        event.setSendEmail(patient.getEmail() != null && !patient.getEmail().isBlank());
        event.setSendSms(patient.getPhoneNumber() != null && !patient.getPhoneNumber().isBlank());
        event.setTimestamp(System.currentTimeMillis());

        kafkaTemplate.send(notificationEventsTopic, event.getPatientId(), event);
    }

    public void publishPatientStatusChanged(Patient patient) {
        NotificationEventDto event = new NotificationEventDto();
        event.setEventType("PATIENT_STATUS_CHANGED");
        event.setPatientId(patient.getId().toString());
        event.setRecipientEmail(patient.getEmail());
        event.setRecipientPhone(patient.getPhoneNumber());
        event.setSubject("Patient account status changed");
        event.setMessage("Hi " + safeName(patient) + ", your account status is now " + (patient.isActive() ? "ACTIVE" : "INACTIVE") + ".");
        event.setSendEmail(patient.getEmail() != null && !patient.getEmail().isBlank());
        event.setSendSms(patient.getPhoneNumber() != null && !patient.getPhoneNumber().isBlank());
        event.setTimestamp(System.currentTimeMillis());

        kafkaTemplate.send(notificationEventsTopic, event.getPatientId(), event);
    }

    private String safeName(Patient patient) {
        String firstName = patient.getFirstName() == null ? "" : patient.getFirstName().trim();
        return firstName.isBlank() ? "Patient" : firstName;
    }
}
