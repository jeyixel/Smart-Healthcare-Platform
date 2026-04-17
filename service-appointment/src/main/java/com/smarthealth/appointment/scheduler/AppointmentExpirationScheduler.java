package com.smarthealth.appointment.scheduler;

import com.smarthealth.appointment.entity.Appointment;
import com.smarthealth.appointment.entity.AppointmentStatus;
import com.smarthealth.appointment.entity.PaymentStatus;
import com.smarthealth.appointment.repository.AppointmentRepository;
import com.smarthealth.appointment.service.AppointmentEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class AppointmentExpirationScheduler {

    private final AppointmentRepository appointmentRepository;
    private final AppointmentEventPublisher appointmentEventPublisher;

    @Scheduled(fixedRate = 120000) // Runs every 2 minutes
    @Transactional
    public void processExpiredAppointments() {
        LocalDateTime now = LocalDateTime.now();
        List<Appointment> expiredAppointments = appointmentRepository.findByPaymentStatusAndPaymentDeadlineBefore(
                PaymentStatus.PENDING_PAYMENT, 
                now
        );

        if (expiredAppointments.isEmpty()) {
            return;
        }

        log.info("Found {} appointments with expired payment deadlines. Processing cancellations...", expiredAppointments.size());

        for (Appointment appointment : expiredAppointments) {
            appointment.setStatus(AppointmentStatus.CANCELLED);
            appointment.setPaymentStatus(PaymentStatus.PAYMENT_EXPIRED);
            
            appointmentRepository.save(appointment);
            
            // Publish status changed event to trigger SMS/Email
            appointmentEventPublisher.publishAppointmentEvent("appointment-status-changed", "APPOINTMENT_STATUS_CHANGED", appointment);
            
            log.info("Cancelled appointment {} due to payment expiration.", appointment.getId());
        }
        
        log.info("Successfully processed {} expired appointments.", expiredAppointments.size());
    }
}
