package com.smarthealth.admin.service;

import com.smarthealth.admin.config.AppointmentServiceProperties;
import com.smarthealth.admin.config.DoctorServiceProperties;
import com.smarthealth.admin.config.PatientServiceProperties;
import com.smarthealth.admin.dto.AppointmentResponse;
import com.smarthealth.admin.dto.DoctorResponse;
import com.smarthealth.admin.dto.PatientResponse;
import com.smarthealth.admin.dto.UpdateAppointmentStatusRequest;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AppointmentAdminService {

    private final RestClient appointmentRestClient;
    private final RestClient patientRestClient;
    private final RestClient doctorRestClient;
    private final AppointmentServiceProperties appointmentProperties;
    private final PatientServiceProperties patientProperties;
    private final DoctorServiceProperties doctorProperties;

    public AppointmentAdminService(RestClient appointmentRestClient,
                                   RestClient patientRestClient,
                                   RestClient doctorRestClient,
                                   AppointmentServiceProperties appointmentProperties,
                                   PatientServiceProperties patientProperties,
                                   DoctorServiceProperties doctorProperties) {
        this.appointmentRestClient = appointmentRestClient;
        this.patientRestClient = patientRestClient;
        this.doctorRestClient = doctorRestClient;
        this.appointmentProperties = appointmentProperties;
        this.patientProperties = patientProperties;
        this.doctorProperties = doctorProperties;
    }

    public List<AppointmentResponse> getAllAppointments(String token) {
        List<AppointmentResponse> appointments = appointmentRestClient.get()
                .uri(appointmentProperties.getEndpoints().getBase())
                .header("Authorization", token)
                .retrieve()
                .body(new ParameterizedTypeReference<List<AppointmentResponse>>() {});

        if (appointments == null || appointments.isEmpty()) {
            return List.of();
        }

        Map<UUID, String> patientNames = new HashMap<>();
        Map<UUID, String> doctorNames = new HashMap<>();

        return appointments.stream().map(apt -> {
            String pName = patientNames.computeIfAbsent(apt.patientId(), id -> resolvePatientName(id, token));
            String dName = doctorNames.computeIfAbsent(apt.doctorId(), id -> resolveDoctorName(id, token));
            
            return new AppointmentResponse(
                apt.id(), apt.patientId(), apt.doctorId(),
                apt.appointmentDate(), apt.appointmentTime(),
                pName, dName,
                apt.consultationType(), apt.status(),
                apt.reason(), apt.notes(),
                apt.createdAt(), apt.updatedAt()
            );
        }).toList();
    }

    private String resolvePatientName(UUID patientId, String token) {
        try {
            PatientResponse response = patientRestClient.get()
                    .uri(patientProperties.getEndpoints().getBase() + "/" + patientId)
                    .header("Authorization", token)
                    .retrieve()
                    .body(PatientResponse.class);
            return response != null ? response.firstName() + " " + response.lastName() : patientId.toString();
        } catch (Exception e) {
            return "Patient " + patientId.toString().substring(0, 8);
        }
    }

    private String resolveDoctorName(UUID doctorId, String token) {
        try {
            DoctorResponse response = doctorRestClient.get()
                    .uri(doctorProperties.getEndpoints().getBase() + "/" + doctorId)
                    .header("Authorization", token)
                    .retrieve()
                    .body(DoctorResponse.class);
            return response != null ? response.fullName() : "Dr. " + doctorId.toString().substring(0, 8);
        } catch (Exception e) {
            return "Doctor " + doctorId.toString().substring(0, 8);
        }
    }

    public AppointmentResponse updateStatus(UUID appointmentId, UpdateAppointmentStatusRequest request, String token) {
        return appointmentRestClient.patch()
                .uri(appointmentProperties.getEndpoints().getBase() + "/" + appointmentId + "/status")
                .header("Authorization", token)
                .body(request)
                .retrieve()
                .body(AppointmentResponse.class);
    }
}
