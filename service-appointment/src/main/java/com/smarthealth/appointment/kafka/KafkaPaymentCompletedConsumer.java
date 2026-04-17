package com.smarthealth.appointment.kafka;

import com.smarthealth.appointment.dto.PaymentCompletedEventDto;
import com.smarthealth.appointment.entity.Appointment;
import com.smarthealth.appointment.entity.AppointmentStatus;
import com.smarthealth.appointment.entity.PaymentStatus;
import com.smarthealth.appointment.repository.AppointmentRepository;
import com.smarthealth.appointment.service.AppointmentEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class KafkaPaymentCompletedConsumer {

    private final AppointmentRepository appointmentRepository;
    private final AppointmentEventPublisher appointmentEventPublisher;

    @KafkaListener(topics = "payment-completed", groupId = "appointment-service")
    public void handlePaymentCompleted(PaymentCompletedEventDto event) {
        log.info("Received payment-completed event for appointment: {}, status: {}", event.getAppointmentId(), event.getPaymentStatus());

        try {
            UUID appointmentId = UUID.fromString(event.getAppointmentId());
            Appointment appointment = appointmentRepository.findById(appointmentId).orElse(null);

            if (appointment == null) {
                log.warn("Appointment not found: {}", appointmentId);
                return;
            }

            if (appointment.getPaymentStatus() != PaymentStatus.PENDING_PAYMENT) {
                log.warn("Optimistic lock/Idempotency check failed: Appointment {} is currently {}, ignoring payment update.", appointmentId, appointment.getPaymentStatus());
                return;
            }
            
            if (appointment.getPaymentReference() != null && !appointment.getPaymentReference().equals(event.getPaymentReference())) {
                log.warn("Stale payment event for Appointment {}: Event reference '{}' does not match current reference '{}'", 
                         appointmentId, event.getPaymentReference(), appointment.getPaymentReference());
                return;
            }

            if ("SUCCESS".equalsIgnoreCase(event.getPaymentStatus())) {
                appointment.setStatus(AppointmentStatus.CONFIRMED);
                appointment.setPaymentStatus(PaymentStatus.PAYMENT_COMPLETED);
            } else if ("FAILED".equalsIgnoreCase(event.getPaymentStatus())) {
                appointment.setStatus(AppointmentStatus.CANCELLED);
                appointment.setPaymentStatus(PaymentStatus.PAYMENT_FAILED);
            }

            appointmentRepository.save(appointment);
            
            // Publish status changed event to notify patient/doctor
            appointmentEventPublisher.publishAppointmentEvent("appointment-status-changed", "APPOINTMENT_STATUS_CHANGED", appointment);

        } catch (IllegalArgumentException e) {
            log.error("Invalid appointment ID format: {}", event.getAppointmentId());
        } catch (Exception e) {
            log.error("Failed to process payment-completed event for appointment: {}", event.getAppointmentId(), e);
        }
    }
}
