package com.smarthealth.admin.service;

import com.smarthealth.admin.config.PatientServiceProperties;
import com.smarthealth.admin.dto.PatientResponse;
import com.smarthealth.admin.dto.PatientUpsertRequest;
import com.smarthealth.admin.dto.PrescriptionSnapshotResponse;
import com.smarthealth.admin.dto.PrescriptionSnapshotUpsertRequest;
import com.smarthealth.admin.model.Role;
import com.smarthealth.admin.model.User;
import com.smarthealth.admin.repository.UserRepository;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.UUID;

@Service
public class PatientAdminService {

    private final RestClient patientRestClient;
    private final PatientServiceProperties properties;
    private final AdminAuditService adminAuditService;
    private final UserRepository userRepository;

    public PatientAdminService(RestClient patientRestClient,
                               PatientServiceProperties properties,
                               AdminAuditService adminAuditService,
                               UserRepository userRepository) {
        this.patientRestClient = patientRestClient;
        this.properties = properties;
        this.adminAuditService = adminAuditService;
        this.userRepository = userRepository;
    }

    public void registerPatient(com.smarthealth.admin.dto.PatientUpsertRequest request) {
        patientRestClient.post()
                .uri(properties.getEndpoints().getBase())
                .body(request)
                .retrieve()
                .toBodilessEntity();
    }

    public PatientResponse setPatientActiveStatus(UUID patientId, boolean active, String requestedBy) {
        PatientResponse response = patientRestClient.patch()
            .uri(uriBuilder -> uriBuilder
                .path(properties.getEndpoints().getSetStatus())
                .queryParam("active", active)
                .build(patientId))
                .retrieve()
                .body(PatientResponse.class);
        adminAuditService.logPatientStatusChange(patientId, active, requestedBy);
        return response;
    }

    public PrescriptionSnapshotResponse upsertPrescriptionSnapshot(PrescriptionSnapshotUpsertRequest request,
                                                                   String requestedBy) {
        PrescriptionSnapshotResponse response = patientRestClient.post()
                .uri(properties.getEndpoints().getUpsertPrescription())
                .body(request)
                .retrieve()
                .body(PrescriptionSnapshotResponse.class);
        adminAuditService.logPrescriptionUpsert(request, requestedBy);
        return response;
    }

    public List<PatientResponse> getAllPatients(String token) {
        return patientRestClient.get()
                .uri(properties.getEndpoints().getBase())
                .header("Authorization", token)
                .retrieve()
                .body(new ParameterizedTypeReference<List<PatientResponse>>() {});
    }

    public void syncMissingPatients() {
        List<User> patients = userRepository.findByRole(Role.PATIENT);
        System.out.println("Starting sync for " + patients.size() + " patients...");
        
        for (User user : patients) {
            try {
                registerPatient(PatientUpsertRequest.builder()
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .email(user.getEmail())
                        .authUserId(user.getId().toString())
                        .phoneNumber("NONE")
                        .build());
                System.out.println("Successfully synced: " + user.getEmail());
            } catch (Exception e) {
                // Usually 409 Conflict if already exists, we ignore it
                System.out.println("Skipped/Failed sync for " + user.getEmail() + ": " + e.getMessage());
            }
        }
    }
}
