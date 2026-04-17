package com.smarthealth.patient.repository;

import com.smarthealth.patient.model.PrescriptionSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PrescriptionSnapshotRepository extends JpaRepository<PrescriptionSnapshot, UUID> {
    List<PrescriptionSnapshot> findByPatientIdOrderByIssuedDateDesc(UUID patientId);

    Optional<PrescriptionSnapshot> findByExternalPrescriptionId(String externalPrescriptionId);
}
