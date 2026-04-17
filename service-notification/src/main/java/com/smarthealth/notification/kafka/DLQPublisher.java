package com.smarthealth.notification.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DLQPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    public static final String NOTIFICATION_DLQ_TOPIC = "notification-dlq";

    public void publishToDLQ(Object event, String originalTopic, String errorMessage) {
        log.warn("Publishing failed event from topic {} to DLQ. Error: {}", originalTopic, errorMessage);
        try {
            // We can wrap this in a DLQ wrapper if needed, but for now we'll send the raw event
            kafkaTemplate.send(NOTIFICATION_DLQ_TOPIC, event);
        } catch (Exception e) {
            log.error("Failed to publish to DLQ topic {}: {}", NOTIFICATION_DLQ_TOPIC, e.getMessage());
        }
    }
}
