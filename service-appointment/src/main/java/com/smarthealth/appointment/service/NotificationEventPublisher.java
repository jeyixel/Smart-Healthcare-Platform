package com.smarthealth.appointment.service;

import com.smarthealth.appointment.dto.AppointmentNotificationEvent;
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

    @Value("${notification.kafka.topic.appointment:appointment.notification.events}")
    private String appointmentNotificationTopic;

    public void publishAppointmentBooked(AppointmentNotificationEvent event) {
        event.setEventType("APPOINTMENT_BOOKED");
        kafkaTemplate.send(appointmentNotificationTopic, event.getAppointmentId(), event)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.warn("Failed to publish APPOINTMENT_BOOKED for appointmentId={}: {}", event.getAppointmentId(), ex.getMessage());
                    } else {
                        log.info("Published APPOINTMENT_BOOKED for appointmentId={} to topic={}", event.getAppointmentId(), appointmentNotificationTopic);
                    }
                });
    }

    public void publishAppointmentCancelled(AppointmentNotificationEvent event) {
        event.setEventType("APPOINTMENT_CANCELLED");
        kafkaTemplate.send(appointmentNotificationTopic, event.getAppointmentId(), event)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.warn("Failed to publish APPOINTMENT_CANCELLED for appointmentId={}: {}", event.getAppointmentId(), ex.getMessage());
                    } else {
                        log.info("Published APPOINTMENT_CANCELLED for appointmentId={} to topic={}", event.getAppointmentId(), appointmentNotificationTopic);
                    }
                });
    }
}

