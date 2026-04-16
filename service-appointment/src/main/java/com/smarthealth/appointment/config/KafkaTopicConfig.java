package com.smarthealth.appointment.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicConfig {

    @Bean
    public NewTopic appointmentCreatedTopic() {
        return TopicBuilder.name("appointment-created")
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic appointmentRescheduledTopic() {
        return TopicBuilder.name("appointment-rescheduled")
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic appointmentStatusChangedTopic() {
        return TopicBuilder.name("appointment-status-changed")
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic appointmentReminderTopic() {
        return TopicBuilder.name("appointment-reminder")
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic paymentCompletedTopic() {
        return TopicBuilder.name("payment-completed")
                .partitions(3)
                .replicas(1)
                .build();
    }
}
