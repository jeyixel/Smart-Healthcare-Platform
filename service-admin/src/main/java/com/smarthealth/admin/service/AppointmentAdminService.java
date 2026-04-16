package com.smarthealth.admin.service;

import com.smarthealth.admin.config.AppointmentServiceProperties;
import com.smarthealth.admin.dto.AppointmentResponse;
import com.smarthealth.admin.dto.UpdateAppointmentStatusRequest;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.UUID;

@Service
public class AppointmentAdminService {

    private final RestClient appointmentRestClient;
    private final AppointmentServiceProperties properties;

    public AppointmentAdminService(RestClient appointmentRestClient, AppointmentServiceProperties properties) {
        this.appointmentRestClient = appointmentRestClient;
        this.properties = properties;
    }

    public List<AppointmentResponse> getAllAppointments(String token) {
        return appointmentRestClient.get()
                .uri(properties.getEndpoints().getBase())
                .header("Authorization", token)
                .retrieve()
                .body(new ParameterizedTypeReference<List<AppointmentResponse>>() {});
    }

    public AppointmentResponse updateStatus(UUID appointmentId, UpdateAppointmentStatusRequest request, String token) {
        return appointmentRestClient.patch()
                .uri(properties.getEndpoints().getBase() + "/" + appointmentId + "/status")
                .header("Authorization", token)
                .body(request)
                .retrieve()
                .body(AppointmentResponse.class);
    }
}
