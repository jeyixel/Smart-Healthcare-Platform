package com.smarthealth.admin.service;

import com.smarthealth.admin.config.PatientServiceProperties;
import com.smarthealth.admin.dto.PatientResponse;
import com.smarthealth.admin.dto.PrescriptionSnapshotResponse;
import com.smarthealth.admin.dto.PrescriptionSnapshotUpsertRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.UUID;

@Service
public class PatientAdminService {

    private final RestClient patientRestClient;
    private final PatientServiceProperties properties;
    private final AdminAuditService adminAuditService;

    public PatientAdminService(RestClient patientRestClient,
                               PatientServiceProperties properties,
                               AdminAuditService adminAuditService) {
        this.patientRestClient = patientRestClient;
        this.properties = properties;
        this.adminAuditService = adminAuditService;
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
}
