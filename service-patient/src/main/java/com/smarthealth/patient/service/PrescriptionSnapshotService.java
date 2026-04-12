package com.smarthealth.patient.service;

import com.smarthealth.patient.dto.PrescriptionSnapshotResponse;
import com.smarthealth.patient.dto.PrescriptionSnapshotUpsertRequest;
import com.smarthealth.patient.exception.ResourceNotFoundException;
import com.smarthealth.patient.model.Patient;
import com.smarthealth.patient.model.PrescriptionSnapshot;
import com.smarthealth.patient.repository.PatientRepository;
import com.smarthealth.patient.repository.PrescriptionSnapshotRepository;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class PrescriptionSnapshotService {

    private final PrescriptionSnapshotRepository prescriptionSnapshotRepository;
    private final PatientRepository patientRepository;

    public PrescriptionSnapshotService(PrescriptionSnapshotRepository prescriptionSnapshotRepository,
                                       PatientRepository patientRepository) {
        this.prescriptionSnapshotRepository = prescriptionSnapshotRepository;
        this.patientRepository = patientRepository;
    }

    public PrescriptionSnapshotResponse upsert(PrescriptionSnapshotUpsertRequest request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found for id " + request.getPatientId()));

        PrescriptionSnapshot snapshot = prescriptionSnapshotRepository
                .findByExternalPrescriptionId(request.getExternalPrescriptionId())
                .orElseGet(PrescriptionSnapshot::new);

        snapshot.setPatient(patient);
        snapshot.setExternalPrescriptionId(request.getExternalPrescriptionId());
        snapshot.setDoctorId(request.getDoctorId());
        snapshot.setMedicationSummary(request.getMedicationSummary());
        snapshot.setIssuedDate(request.getIssuedDate());
        snapshot.setStatus(request.getStatus());
        snapshot.setSyncedAt(OffsetDateTime.now());

        PrescriptionSnapshot saved = prescriptionSnapshotRepository.save(snapshot);
        return map(saved);
    }

    public List<PrescriptionSnapshotResponse> getByPatient(UUID patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient not found for id " + patientId);
        }

        return prescriptionSnapshotRepository.findByPatientIdOrderByIssuedDateDesc(patientId)
                .stream()
                .map(this::map)
                .toList();
    }

    private PrescriptionSnapshotResponse map(PrescriptionSnapshot snapshot) {
        return new PrescriptionSnapshotResponse(
                snapshot.getId(),
                snapshot.getPatient().getId(),
                snapshot.getExternalPrescriptionId(),
                snapshot.getDoctorId(),
                snapshot.getMedicationSummary(),
                snapshot.getIssuedDate(),
                snapshot.getStatus(),
                snapshot.getSyncedAt()
        );
    }
}
