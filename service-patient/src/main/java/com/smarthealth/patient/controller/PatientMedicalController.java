package com.smarthealth.patient.controller;

import com.smarthealth.patient.dto.MedicalHistoryCreateRequest;
import com.smarthealth.patient.dto.MedicalHistoryResponse;
import com.smarthealth.patient.dto.MedicalReportCreateRequest;
import com.smarthealth.patient.dto.MedicalReportResponse;
import com.smarthealth.patient.dto.PrescriptionSnapshotResponse;
import com.smarthealth.patient.service.MedicalHistoryService;
import com.smarthealth.patient.service.MedicalReportService;
import com.smarthealth.patient.service.PrescriptionSnapshotService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/patients/{patientId}")
public class PatientMedicalController {

    private final MedicalHistoryService medicalHistoryService;
    private final MedicalReportService medicalReportService;
    private final PrescriptionSnapshotService prescriptionSnapshotService;

    public PatientMedicalController(MedicalHistoryService medicalHistoryService,
                                   MedicalReportService medicalReportService,
                                   PrescriptionSnapshotService prescriptionSnapshotService) {
        this.medicalHistoryService = medicalHistoryService;
        this.medicalReportService = medicalReportService;
        this.prescriptionSnapshotService = prescriptionSnapshotService;
    }

    @PostMapping("/medical-histories")
    @ResponseStatus(HttpStatus.CREATED)
    public MedicalHistoryResponse addMedicalHistory(@PathVariable UUID patientId,
                                                    @Valid @RequestBody MedicalHistoryCreateRequest request) {
        return medicalHistoryService.create(patientId, request);
    }

    @GetMapping("/medical-histories")
    public List<MedicalHistoryResponse> listMedicalHistories(@PathVariable UUID patientId) {
        return medicalHistoryService.getByPatient(patientId);
    }

    @PostMapping("/reports")
    @ResponseStatus(HttpStatus.CREATED)
    public MedicalReportResponse addMedicalReport(@PathVariable UUID patientId,
                                                  @Valid @RequestBody MedicalReportCreateRequest request) {
        return medicalReportService.create(patientId, request);
    }

    @GetMapping("/reports")
    public List<MedicalReportResponse> listReports(@PathVariable UUID patientId) {
        return medicalReportService.getByPatient(patientId);
    }

    @GetMapping("/prescriptions")
    public List<PrescriptionSnapshotResponse> listPrescriptionSnapshots(@PathVariable UUID patientId) {
        return prescriptionSnapshotService.getByPatient(patientId);
    }
}
