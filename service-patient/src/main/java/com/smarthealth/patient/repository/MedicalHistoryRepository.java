package com.smarthealth.patient.repository;

import com.smarthealth.patient.model.MedicalHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MedicalHistoryRepository extends JpaRepository<MedicalHistory, UUID> {
    List<MedicalHistory> findByPatientIdOrderByCreatedAtDesc(UUID patientId);
}
