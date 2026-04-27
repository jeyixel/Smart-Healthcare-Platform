package com.smarthealth.patient.client;

import com.smarthealth.patient.dto.PrescriptionResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.UUID;

@Component
public class PrescriptionClient {

    private static final Logger LOGGER = LoggerFactory.getLogger(PrescriptionClient.class);
    private final RestClient restClient;

    public PrescriptionClient(@Value("${service.prescription.url:http://localhost:8088/api/v1/prescriptions}") String prescriptionUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(prescriptionUrl)
                .build();
    }

    public PrescriptionResponse getPrescriptionById(UUID prescriptionId) {
        try {
            return restClient.get()
                    .uri("/{id}", prescriptionId)
                    .retrieve()
                    .body(PrescriptionResponse.class);
        } catch (Exception e) {
            LOGGER.error("Failed to fetch prescription details for ID {}: {}", prescriptionId, e.getMessage());
            return null;
        }
    }
}
