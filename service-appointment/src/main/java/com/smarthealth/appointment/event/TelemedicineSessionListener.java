package com.smarthealth.appointment.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class
TelemedicineSessionListener {

    private final RestTemplate restTemplate;

    // telemedicine.service.url should point to the telemedicine service endpoint
    @Value("${telemedicine.service.url}")
    private String telemedicineServiceUrl;

    // Important caveat: AFTER_COMMIT means this method runs in a separate thread
    // (or at least after the commit completes) and failures here will NOT roll back
    // the original transaction — which is intentional: the appointment should
    // remain created even if the external telemedicine service is temporarily
    // unavailable.
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleOnlineAppointmentCreated(OnlineAppointmentCreatedEvent event) {
        try {
            Map<String, String> requestData = new HashMap<>();
            requestData.put("appointmentId", event.appointmentId().toString());
            requestData.put("patientId", event.patientId().toString());
            requestData.put("doctorId", event.doctorId().toString());

            // Perform the POST. We intentionally ignore the response body and only log success / failure.
            restTemplate.postForEntity(telemedicineServiceUrl, requestData, Object.class);
            log.info("Created telemedicine session for appointment {}", event.appointmentId());

        } catch (Exception ex) {
            log.error("Failed to create telemedicine session for appointment {}: {}",
                    event.appointmentId(), ex.getMessage());
        }
    }
}
