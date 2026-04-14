package com.smarthealth.patient.service;

import com.smarthealth.patient.dto.PatientResponse;
import com.smarthealth.patient.dto.PatientUpsertRequest;
import com.smarthealth.patient.exception.DuplicateResourceException;
import com.smarthealth.patient.exception.ResourceNotFoundException;
import com.smarthealth.patient.model.Patient;
import com.smarthealth.patient.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class PatientService {

    private final PatientRepository patientRepository;

    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    public PatientResponse create(PatientUpsertRequest request) {
        if (patientRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Patient with the same email already exists");
        }
        if (request.getAuthUserId() != null && patientRepository.existsByAuthUserId(request.getAuthUserId())) {
            throw new DuplicateResourceException("Patient with the same auth user id already exists");
        }

        Patient patient = new Patient();
        apply(patient, request);
        Patient saved = patientRepository.save(patient);
        return map(saved);
    }

    public PatientResponse getById(UUID id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found for id " + id));
        return map(patient);
    }

    public List<PatientResponse> getAll() {
        return patientRepository.findAll().stream().map(this::map).toList();
    }

    public PatientResponse update(UUID id, PatientUpsertRequest request) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found for id " + id));

        if (patientRepository.existsByEmailAndIdNot(request.getEmail(), id)) {
            throw new DuplicateResourceException("Another patient already uses this email");
        }
        if (request.getAuthUserId() != null
                && patientRepository.existsByAuthUserIdAndIdNot(request.getAuthUserId(), id)) {
            throw new DuplicateResourceException("Another patient already uses this auth user id");
        }

        apply(patient, request);
        Patient saved = patientRepository.save(patient);
        return map(saved);
    }

    public void delete(UUID id) {
        if (!patientRepository.existsById(id)) {
            throw new ResourceNotFoundException("Patient not found for id " + id);
        }

        patientRepository.deleteById(id);
    }

    private void apply(Patient patient, PatientUpsertRequest request) {
        patient.setAuthUserId(request.getAuthUserId());
        patient.setFirstName(request.getFirstName());
        patient.setLastName(request.getLastName());
        patient.setEmail(request.getEmail());
        patient.setPhoneNumber(request.getPhoneNumber());
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setGender(request.getGender());
        patient.setBloodGroup(request.getBloodGroup());
        patient.setAddress(request.getAddress());
        patient.setEmergencyContactName(request.getEmergencyContactName());
        patient.setEmergencyContactPhone(request.getEmergencyContactPhone());
    }

    private PatientResponse map(Patient patient) {
        return new PatientResponse(
                patient.getId(),
                patient.getAuthUserId(),
                patient.getFirstName(),
                patient.getLastName(),
                patient.getEmail(),
                patient.getPhoneNumber(),
                patient.getDateOfBirth(),
                patient.getGender(),
                patient.getBloodGroup(),
                patient.getAddress(),
                patient.getEmergencyContactName(),
                patient.getEmergencyContactPhone(),
                patient.isActive(),
                patient.getCreatedAt(),
                patient.getUpdatedAt()
        );
    }
}
