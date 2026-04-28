package com.smarthealth.notification.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicConfig {

    @Value("${notification.kafka.topic.appointment:appointment.notification.events}")
    private String appointmentTopic;

    @Value("${notification.kafka.topic.prescription:prescription.notification.events}")
    private String prescriptionTopic;

    @Value("${notification.kafka.topic.appointment.dlt:appointment.notification.events.DLT}")
    private String appointmentDltTopic;

    @Value("${notification.kafka.topic.prescription.dlt:prescription.notification.events.DLT}")
    private String prescriptionDltTopic;

    @Bean
    public NewTopic appointmentNotificationTopic() {
        return TopicBuilder.name(appointmentTopic).partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic prescriptionNotificationTopic() {
        return TopicBuilder.name(prescriptionTopic).partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic appointmentNotificationDltTopic() {
        return TopicBuilder.name(appointmentDltTopic).partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic prescriptionNotificationDltTopic() {
        return TopicBuilder.name(prescriptionDltTopic).partitions(3).replicas(1).build();
    }
}

