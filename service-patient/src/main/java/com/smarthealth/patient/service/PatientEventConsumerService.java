package com.smarthealth.patient.service;

import com.smarthealth.patient.dto.PatientEventDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class PatientEventConsumerService {

    private static final Logger LOGGER = LoggerFactory.getLogger(PatientEventConsumerService.class);

    private final CopyOnWriteArrayList<PatientEventDto> receivedEvents = new CopyOnWriteArrayList<>();

    @KafkaListener(
            topics = "${smarthealth.kafka.topics.patient-events:patient-events}",
            groupId = "${spring.kafka.consumer.group-id:service-patient-group}",
            autoStartup = "${smarthealth.kafka.consumer.enabled:true}"
    )
    public void consumePatientEvent(PatientEventDto event) {
        receivedEvents.add(0, event);
        LOGGER.info("Consumed patient event type={} patientId={} status={}",
                event.getEventType(), event.getPatientId(), event.getStatus());
    }

    public List<PatientEventDto> getReceivedEvents() {
        return List.copyOf(receivedEvents);
    }

    public void clearReceivedEvents() {
        receivedEvents.clear();
    }
}
