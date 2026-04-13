package com.smarthealth.admin.controller;

import com.smarthealth.admin.dto.PatientResponse;
import com.smarthealth.admin.dto.PrescriptionSnapshotResponse;
import com.smarthealth.admin.dto.PrescriptionSnapshotUpsertRequest;
import com.smarthealth.admin.service.PatientAdminService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
public class PatientAdminController {

    private final PatientAdminService patientAdminService;

    public PatientAdminController(PatientAdminService patientAdminService) {
        this.patientAdminService = patientAdminService;
    }

    @PatchMapping("/patients/{patientId}/status")
    public PatientResponse setPatientActiveStatus(@PathVariable UUID patientId,
                                                  @RequestParam boolean active,
                                                  @RequestHeader(value = "X-Admin-User", required = false) String requestedBy) {
        return patientAdminService.setPatientActiveStatus(patientId, active, requestedBy);
    }

    @PostMapping("/prescription-snapshots")
    public PrescriptionSnapshotResponse upsertPrescriptionSnapshot(
            @Valid @RequestBody PrescriptionSnapshotUpsertRequest request,
            @RequestHeader(value = "X-Admin-User", required = false) String requestedBy
    ) {
        return patientAdminService.upsertPrescriptionSnapshot(request, requestedBy);
    }
}
