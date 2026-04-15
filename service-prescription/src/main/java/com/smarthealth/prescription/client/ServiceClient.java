package com.smarthealth.prescription.client;


import com.smarthealth.prescription.dto.external.AppointmentResponse;
import com.smarthealth.prescription.dto.external.DoctorResponse;
import com.smarthealth.prescription.exception.BusinessException;
import com.smarthealth.prescription.exception.ResourceNotFoundException;
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

    @Value("${service.doctor.url}")
    private String doctorServiceUrl;

    @Value("${service.appointment.url}")
    private String appointmentServiceURl;

    public AppointmentResponse getAppointment(UUID id) {
        String token = getJwtFromContext();

        try {
            return webClientBuilder.build()
                    .get()
                    .uri(appointmentServiceURl + "/" + id)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .retrieve()
                    .bodyToMono(AppointmentResponse.class)
                    .timeout(Duration.ofSeconds(10))
                    .block();
        } catch (WebClientResponseException.NotFound e) {
            log.warn("Appointment not found: {}", id);
            throw new ResourceNotFoundException("Appointment not found: " + id);
        } catch (Exception e) {
            log.error("Error fetching Appointment: {}", id, e);
            throw new BusinessException("Failed to fetch appointment: " + id + ". Error: " + e.getMessage());
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
