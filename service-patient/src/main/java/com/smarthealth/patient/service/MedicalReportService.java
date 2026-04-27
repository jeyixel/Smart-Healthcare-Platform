package com.smarthealth.patient.service;

import com.smarthealth.patient.dto.MedicalReportCreateRequest;
import com.smarthealth.patient.dto.MedicalReportResponse;
import com.smarthealth.patient.exception.ResourceNotFoundException;
import com.smarthealth.patient.model.MedicalReport;
import com.smarthealth.patient.model.Patient;
import com.smarthealth.patient.repository.MedicalReportRepository;
import com.smarthealth.patient.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
public class MedicalReportService {

    private final MedicalReportRepository medicalReportRepository;
    private final PatientRepository patientRepository;

    public MedicalReportService(MedicalReportRepository medicalReportRepository, PatientRepository patientRepository) {
        this.medicalReportRepository = medicalReportRepository;
        this.patientRepository = patientRepository;
    }

    public MedicalReportResponse create(UUID patientId, MedicalReportCreateRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found for id " + patientId));

        MedicalReport report = new MedicalReport();
        report.setPatient(patient);
        report.setReportType(request.getReportType());
        report.setTitle(request.getTitle());
        report.setStorageKey(request.getStorageKey());
        report.setFileName(request.getFileName());
        report.setMimeType(request.getMimeType());
        report.setFileSize(request.getFileSize());
        report.setChecksum(request.getChecksum());
        report.setUploadedByRole(request.getUploadedByRole());
        report.setFileData(Base64.getDecoder().decode(request.getFileData()));

        MedicalReport saved = medicalReportRepository.save(report);
        return map(saved);
    }

    @Transactional
    public void delete(UUID patientId, UUID reportId) {
        MedicalReport report = medicalReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found for id " + reportId));
        if (!report.getPatient().getId().equals(patientId)) {
            throw new ResourceNotFoundException("Report does not belong to patient " + patientId);
        }
        medicalReportRepository.deleteById(reportId);
    }

    public List<MedicalReportResponse> getByPatient(UUID patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient not found for id " + patientId);
        }

        return medicalReportRepository.findByPatientIdOrderByUploadedAtDesc(patientId)
                .stream()
                .map(this::map)
                .toList();
    }

    private MedicalReportResponse map(MedicalReport report) {
        String fileDataBase64 = (report.getFileData() != null)
                ? Base64.getEncoder().encodeToString(report.getFileData())
                : null;
        return new MedicalReportResponse(
                report.getId(),
                report.getPatient().getId(),
                report.getReportType(),
                report.getTitle(),
                report.getStorageKey(),
                report.getFileName(),
                report.getMimeType(),
                report.getFileSize(),
                report.getChecksum(),
                report.getUploadedByRole(),
                fileDataBase64,
                report.getUploadedAt()
        );
    }
}
