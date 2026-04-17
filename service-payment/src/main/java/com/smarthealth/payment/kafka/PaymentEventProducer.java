package com.smarthealth.payment.kafka;

import com.smarthealth.payment.config.KafkaConfig;
import com.smarthealth.payment.dto.PaymentEventDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void sendPaymentSuccess(PaymentEventDto event) {
        kafkaTemplate.send(KafkaConfig.PAYMENT_SUCCESS_TOPIC, event.getOrderId(), event);
        log.info("Payment success event sent for order: {}", event.getOrderId());
    }

    public void sendPaymentFailed(PaymentEventDto event) {
        kafkaTemplate.send(KafkaConfig.PAYMENT_FAILED_TOPIC, event.getOrderId(), event);
        log.info("Payment failed event sent for order: {}", event.getOrderId());
    }

    public void sendPaymentCompleted(com.smarthealth.payment.dto.PaymentCompletedEventDto event) {
        kafkaTemplate.send("payment-completed", event.getAppointmentId(), event);
        log.info("Payment-completed event sent for appointment: {}", event.getAppointmentId());
    }
}