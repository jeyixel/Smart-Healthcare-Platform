package com.smarthealth.patient.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class MedicalHistoryCreateRequest {

    @NotBlank(message = "Condition name is required")
    @Size(max = 200, message = "Condition name must be less than 200 characters")
    private String conditionName;

    private LocalDate diagnosisDate;

    @Size(max = 100, message = "Source must be less than 100 characters")
    private String source;

    @Size(max = 2000, message = "Notes must be less than 2000 characters")
    private String notes;

    public String getConditionName() {
        return conditionName;
    }

    public void setConditionName(String conditionName) {
        this.conditionName = conditionName;
    }

    public LocalDate getDiagnosisDate() {
        return diagnosisDate;
    }

    public void setDiagnosisDate(LocalDate diagnosisDate) {
        this.diagnosisDate = diagnosisDate;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
