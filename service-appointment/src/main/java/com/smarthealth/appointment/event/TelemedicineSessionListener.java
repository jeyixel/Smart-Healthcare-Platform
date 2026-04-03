package com.smarthealth.appointment.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.web.client.RestTemplate;

import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class TelemedicineSessionListener {

    private final RestTemplate restTemplate;

    // telemedicine.service.url should point to the telemedicine service endpoint
    @Value("${telemedicine.service.url}")
    private String telemedicineServiceUrl;

    // Validate that the telemedicine service URL is properly configured on startup
    @PostConstruct
    public void validateConfiguration() {
        if (telemedicineServiceUrl == null || telemedicineServiceUrl.trim().isEmpty()) {
            log.error("CRITICAL: telemedicine.service.url environment variable is not set or is empty. "
                    + "Telemedicine sessions will NOT be created for online appointments. "
                    + "Please configure the 'telemedicine.service.url' property in application.yml or as an environment variable.");
        } else {
            log.info("TelemedicineSessionListener initialized successfully with service URL: {}", telemedicineServiceUrl);
        }
    }

    // Important caveat: AFTER_COMMIT means this method runs in a separate thread
    // (or at least after the commit completes) and failures here will NOT roll back
    // the original transaction — which is intentional: the appointment should
    // remain created even if the external telemedicine service is temporarily
    // unavailable.
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleOnlineAppointmentCreated(OnlineAppointmentCreatedEvent event) {
        log.debug("Processing online appointment event for appointmentId: {}", event.appointmentId());

        // Safe exit if service URL is not configured
        if (telemedicineServiceUrl == null || telemedicineServiceUrl.trim().isEmpty()) {
            log.warn("Skipping telemedicine session creation for appointment {} - service URL not configured. "
                    + "Online appointment was created but telemedicine session was NOT initiated.", event.appointmentId());
            return;
        }

        try {
            Map<String, String> requestData = new HashMap<>();
            requestData.put("appointmentId", event.appointmentId().toString());
            requestData.put("patientId", event.patientId().toString());
            requestData.put("doctorId", event.doctorId().toString());

            log.debug("Sending telemedicine session creation request to: {} with appointmentId: {}", 
                    telemedicineServiceUrl, event.appointmentId());

            // Perform the POST. We intentionally ignore the response body and only log success / failure.
            restTemplate.postForEntity(telemedicineServiceUrl, requestData, Object.class);
            log.info("✓ Telemedicine session successfully created for appointment {} (patient: {}, doctor: {})", 
                    event.appointmentId(), event.patientId(), event.doctorId());

        } catch (Exception ex) {
            log.error("✗ Failed to create telemedicine session for appointment {}: {} | Message: {}",
                    event.appointmentId(), ex.getClass().getSimpleName(), ex.getMessage());
            log.debug("Exception details:", ex);
            // No rethrow - appointment remains valid even if telemedicine session creation fails
        }
    }
}
