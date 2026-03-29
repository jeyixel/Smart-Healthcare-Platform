package com.smarthealth.patient.repository;

import com.smarthealth.patient.model.MedicalReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MedicalReportRepository extends JpaRepository<MedicalReport, UUID> {
    List<MedicalReport> findByPatientIdOrderByUploadedAtDesc(UUID patientId);
}
