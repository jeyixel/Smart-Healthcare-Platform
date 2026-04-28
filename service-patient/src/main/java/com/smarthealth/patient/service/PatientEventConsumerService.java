package com.smarthealth.patient.service;

import com.smarthealth.patient.dto.PatientEventDto;
import com.smarthealth.patient.dto.PrescriptionEventDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class PatientEventConsumerService {

    private static final Logger LOGGER = LoggerFactory.getLogger(PatientEventConsumerService.class);

    private final CopyOnWriteArrayList<PatientEventDto> receivedEvents = new CopyOnWriteArrayList<>();
    private final MedicationReminderService reminderService;

    public PatientEventConsumerService(MedicationReminderService reminderService) {
        this.reminderService = reminderService;
    }

    @KafkaListener(
            topics = "${smarthealth.kafka.topics.patient-events:patient-events}",
            groupId = "${spring.kafka.consumer.group-id:service-patient-group}"
    )
    public void consumePatientEvent(PatientEventDto event) {
        receivedEvents.add(0, event);
        LOGGER.info("Consumed patient event type={} patientId={} status={}",
                event.getEventType(), event.getPatientId(), event.getStatus());
    }

    @KafkaListener(
            topics = "prescription-updated",
            groupId = "${spring.kafka.consumer.group-id:service-patient-group}",
            properties = {"spring.json.value.default.type=com.smarthealth.patient.dto.PrescriptionEventDto"}
    )
    public void consumePrescriptionEvent(PrescriptionEventDto event) {
        LOGGER.info("Consumed prescription event type={} prescriptionId={}",
                event.getEventType(), event.getPrescriptionId());
                
        if ("PRESCRIPTION_ISSUED".equals(event.getEventType()) || "PRESCRIPTION_CREATED".equals(event.getEventType())) {
            try {
                UUID prescriptionId = UUID.fromString(event.getPrescriptionId());
                reminderService.generateRemindersFromPrescription(prescriptionId);
            } catch (Exception e) {
                LOGGER.error("Failed to generate reminders for prescription {}: {}", event.getPrescriptionId(), e.getMessage());
            }
        }
    }

    public List<PatientEventDto> getReceivedEvents() {
        return List.copyOf(receivedEvents);
    }

    public void clearReceivedEvents() {
        receivedEvents.clear();
    }
}
