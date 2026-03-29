package com.smarthealth.patient.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

public class PrescriptionSnapshotUpsertRequest {

    @NotNull(message = "Patient id is required")
    private UUID patientId;

    @NotBlank(message = "External prescription id is required")
    @Size(max = 100, message = "External prescription id must be less than 100 characters")
    private String externalPrescriptionId;

    @Size(max = 100, message = "Doctor id must be less than 100 characters")
    private String doctorId;

    @NotBlank(message = "Medication summary is required")
    @Size(max = 3000, message = "Medication summary must be less than 3000 characters")
    private String medicationSummary;

    private LocalDate issuedDate;

    @NotBlank(message = "Status is required")
    @Size(max = 50, message = "Status must be less than 50 characters")
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
