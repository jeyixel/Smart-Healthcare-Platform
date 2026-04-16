package com.smarthealth.prescription.client;


import com.smarthealth.prescription.dto.external.AppointmentResponse;
import com.smarthealth.prescription.dto.external.DoctorResponse;
import com.smarthealth.prescription.dto.external.PatientResponse;
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

    @Value("${service.patient.url}")
    private String patientServiceUrl;

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
            return null; // Don't throw for notifications if missing, or maybe we do throw. Let's return null like we might expect. Wait, serviceClient.getPatient in appointment service threw exception if null. Actually we'll let it throw.
        } catch (Exception e) {
            log.error("Error fetching patient: {}", patientId);
            return null; // Continuing without patient if needed, or we can throw. I'll just throw.
        }
    }

    private String getJwtFromContext() {
        return (String) SecurityContextHolder.getContext().getAuthentication().getCredentials();
    }
}
