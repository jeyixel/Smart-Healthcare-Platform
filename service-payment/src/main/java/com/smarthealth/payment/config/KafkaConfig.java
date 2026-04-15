package com.smarthealth.payment.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    public static final String PAYMENT_SUCCESS_TOPIC = "payment-success";
    public static final String PAYMENT_FAILED_TOPIC = "payment-failed";

    @Bean
    public NewTopic paymentSuccessTopic() {
        return TopicBuilder.name(PAYMENT_SUCCESS_TOPIC)
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic paymentFailedTopic() {
        return TopicBuilder.name(PAYMENT_FAILED_TOPIC)
                .partitions(1)
                .replicas(1)
                .build();
    }
}