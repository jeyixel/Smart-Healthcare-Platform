package com.smarthealth.appointment.client;

import com.smarthealth.appointment.dto.external.DoctorResponse;
import com.smarthealth.appointment.dto.external.PatientResponse;
import com.smarthealth.appointment.exception.BusinessException;
import com.smarthealth.appointment.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ServiceClient {

    private final WebClient.Builder webClientBuilder;

    @Value("${service.patient.url}")
    private String patientServiceUrl;

    @Value("${service.doctor.url}")
    private String doctorServiceUrl;

    public PatientResponse getPatient(UUID patientId) {
        String token = getJwtFromContext();

        try {
            return webClientBuilder.build()
                    .get()
                    .uri(patientServiceUrl + "/" + patientId)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .retrieve()
                    .bodyToMono(PatientResponse.class)
                    .timeout(Duration.ofSeconds(10))
                    .block();
        } catch (WebClientResponseException.NotFound e) {
            log.warn("Patient not found: {}", patientId);
            throw new ResourceNotFoundException("Patient not found: " + patientId);
        } catch (Exception e) {
            log.error("Error fetching patient: {}", patientId, e);
            throw new BusinessException("Failed to fetch patient: " + patientId + ". Error: " + e.getMessage());
        }
    }

    public DoctorResponse getDoctor(UUID doctorId) {
        String token = getJwtFromContext();

        try {
            return webClientBuilder.build()
                    .get()
                    .uri(doctorServiceUrl + "/" + doctorId)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .retrieve()
                    .bodyToMono(DoctorResponse.class)
                    .timeout(Duration.ofSeconds(10))
                    .block();
        } catch (WebClientResponseException.NotFound e) {
            log.warn("Doctor not found: {}", doctorId);
            throw new ResourceNotFoundException("Doctor not found: " + doctorId);
        } catch (Exception e) {
            log.error("Error fetching doctor: {}", doctorId);
            throw new BusinessException("Failed to fetch doctor: " + doctorId + ". Error: " + e.getMessage());
        }
    }

    private String getJwtFromContext() {
        return (String) SecurityContextHolder.getContext().getAuthentication().getCredentials();
    }
}