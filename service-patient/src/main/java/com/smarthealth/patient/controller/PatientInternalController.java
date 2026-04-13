package com.smarthealth.patient.controller;

import com.smarthealth.patient.dto.PatientResponse;
import com.smarthealth.patient.dto.PrescriptionSnapshotResponse;
import com.smarthealth.patient.dto.PrescriptionSnapshotUpsertRequest;
import com.smarthealth.patient.service.PatientService;
import com.smarthealth.patient.service.PrescriptionSnapshotService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/internal")
public class PatientInternalController {

    private final PatientService patientService;
    private final PrescriptionSnapshotService prescriptionSnapshotService;

    public PatientInternalController(PatientService patientService,
                                     PrescriptionSnapshotService prescriptionSnapshotService) {
        this.patientService = patientService;
        this.prescriptionSnapshotService = prescriptionSnapshotService;
    }

    @PatchMapping("/patients/{patientId}/status")
    public PatientResponse setPatientStatus(@PathVariable UUID patientId,
                                            @RequestParam boolean active) {
        return patientService.setActiveStatus(patientId, active);
    }

    @PostMapping("/prescription-snapshots")
    public PrescriptionSnapshotResponse upsertPrescriptionSnapshot(
            @Valid @RequestBody PrescriptionSnapshotUpsertRequest request) {
        return prescriptionSnapshotService.upsert(request);
    }
}
