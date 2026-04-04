package com.smarthealth.patient.service;

import com.smarthealth.patient.dto.MedicalHistoryCreateRequest;
import com.smarthealth.patient.dto.MedicalHistoryResponse;
import com.smarthealth.patient.exception.ResourceNotFoundException;
import com.smarthealth.patient.model.MedicalHistory;
import com.smarthealth.patient.model.Patient;
import com.smarthealth.patient.repository.MedicalHistoryRepository;
import com.smarthealth.patient.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class MedicalHistoryService {

    private final MedicalHistoryRepository medicalHistoryRepository;
    private final PatientRepository patientRepository;

    public MedicalHistoryService(MedicalHistoryRepository medicalHistoryRepository, PatientRepository patientRepository) {
        this.medicalHistoryRepository = medicalHistoryRepository;
        this.patientRepository = patientRepository;
    }

    public MedicalHistoryResponse create(UUID patientId, MedicalHistoryCreateRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found for id " + patientId));

        MedicalHistory history = new MedicalHistory();
        history.setPatient(patient);
        history.setConditionName(request.getConditionName());
        history.setDiagnosisDate(request.getDiagnosisDate());
        history.setSource(request.getSource());
        history.setNotes(request.getNotes());

        MedicalHistory saved = medicalHistoryRepository.save(history);
        return map(saved);
    }

    public List<MedicalHistoryResponse> getByPatient(UUID patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient not found for id " + patientId);
        }

        return medicalHistoryRepository.findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream()
                .map(this::map)
                .toList();
    }

    private MedicalHistoryResponse map(MedicalHistory history) {
        return new MedicalHistoryResponse(
                history.getId(),
                history.getPatient().getId(),
                history.getConditionName(),
                history.getDiagnosisDate(),
                history.getSource(),
                history.getNotes(),
                history.getCreatedAt()
        );
    }
}
