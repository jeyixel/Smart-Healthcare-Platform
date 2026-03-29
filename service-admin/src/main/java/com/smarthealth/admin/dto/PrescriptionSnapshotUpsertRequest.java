package com.smarthealth.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public class PrescriptionSnapshotUpsertRequest {

    @NotNull
    private UUID patientId;

    @NotBlank
    private String externalPrescriptionId;

    @NotBlank
    private String doctorId;

    @NotBlank
    private String medicationSummary;

    @NotNull
    private LocalDate issuedDate;

    @NotBlank
    private String status;

    public UUID getPatientId() {
        return patientId;
    }

    public void setPatientId(UUID patientId) {
        this.patientId = patientId;
    }

    public String getExternalPrescriptionId() {
        return externalPrescriptionId;
    }

    public void setExternalPrescriptionId(String externalPrescriptionId) {
        this.externalPrescriptionId = externalPrescriptionId;
    }

    public String getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(String doctorId) {
        this.doctorId = doctorId;
    }

    public String getMedicationSummary() {
        return medicationSummary;
    }

    public void setMedicationSummary(String medicationSummary) {
        this.medicationSummary = medicationSummary;
    }

    public LocalDate getIssuedDate() {
        return issuedDate;
    }

    public void setIssuedDate(LocalDate issuedDate) {
        this.issuedDate = issuedDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
