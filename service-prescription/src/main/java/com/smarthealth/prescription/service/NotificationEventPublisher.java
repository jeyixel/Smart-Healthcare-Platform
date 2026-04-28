package com.smarthealth.prescription.service;

import com.smarthealth.prescription.dto.PrescriptionNotificationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${notification.kafka.topic.prescription:prescription.notification.events}")
    private String prescriptionNotificationTopic;

    public void publishPrescriptionCreated(PrescriptionNotificationEvent event) {
        event.setEventType("PRESCRIPTION_CREATED");
        kafkaTemplate.send(prescriptionNotificationTopic, event.getPrescriptionId(), event)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.warn("Failed to publish PRESCRIPTION_CREATED for prescriptionId={}: {}", event.getPrescriptionId(), ex.getMessage());
                    } else {
                        log.info("Published PRESCRIPTION_CREATED for prescriptionId={} to topic={}", event.getPrescriptionId(), prescriptionNotificationTopic);
                    }
                });
    }
}

