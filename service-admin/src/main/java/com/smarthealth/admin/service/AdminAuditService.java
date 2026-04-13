package com.smarthealth.admin.service;

import com.smarthealth.admin.dto.PrescriptionSnapshotUpsertRequest;
import com.smarthealth.admin.dto.PatientEventDto;
import com.smarthealth.admin.model.AdminActionLog;
import com.smarthealth.admin.repository.AdminActionLogRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AdminAuditService {

    private static final String DEFAULT_ADMIN_USER = "system-admin";

    @Value("${smarthealth.kafka.topics.patient-events:patient-events}")
    private String patientEventsTopic;

    private final AdminActionLogRepository adminActionLogRepository;
    private final KafkaTemplate<String, PatientEventDto> kafkaTemplate;

    public AdminAuditService(AdminActionLogRepository adminActionLogRepository,
                           KafkaTemplate<String, PatientEventDto> kafkaTemplate) {
        this.adminActionLogRepository = adminActionLogRepository;
        this.kafkaTemplate = kafkaTemplate;
    }

    public void logPatientStatusChange(UUID patientId, boolean active, String requestedBy) {
        AdminActionLog log = new AdminActionLog();
        log.setActionType("PATIENT_STATUS_UPDATED");
        log.setTargetType("PATIENT");
        log.setTargetId(patientId);
        log.setRequestedBy(normalizeRequestedBy(requestedBy));
        log.setDetails("active=" + active);
        adminActionLogRepository.save(log);

        // Publish event to Kafka
        PatientEventDto event = PatientEventDto.builder()
            .patientId(uuidToLong(patientId))
                .eventType("PATIENT_STATUS_UPDATED")
                .description("Patient status updated to: " + (active ? "ACTIVE" : "INACTIVE"))
                .status("COMPLETED")
                .timestamp(System.currentTimeMillis())
                .build();
        kafkaTemplate.send(patientEventsTopic, patientId.toString(), event);
    }

    public void logPrescriptionUpsert(PrescriptionSnapshotUpsertRequest request, String requestedBy) {
        AdminActionLog log = new AdminActionLog();
        log.setActionType("PRESCRIPTION_SNAPSHOT_UPSERTED");
        log.setTargetType("PATIENT");
        log.setTargetId(request.getPatientId());
        log.setRequestedBy(normalizeRequestedBy(requestedBy));
        log.setDetails("externalPrescriptionId=" + request.getExternalPrescriptionId() + ",status=" + request.getStatus());
        adminActionLogRepository.save(log);

        // Publish event to Kafka
        PatientEventDto event = PatientEventDto.builder()
                .patientId(uuidToLong(request.getPatientId()))
                .eventType("PRESCRIPTION_SNAPSHOT_UPSERTED")
                .description("Prescription snapshot upserted: " + request.getExternalPrescriptionId())
                .status("COMPLETED")
                .timestamp(System.currentTimeMillis())
                .build();
        kafkaTemplate.send(patientEventsTopic, request.getPatientId().toString(), event);
    }

    private Long uuidToLong(UUID value) {
        return value == null ? null : value.getMostSignificantBits();
    }

    private String normalizeRequestedBy(String requestedBy) {
        if (requestedBy == null || requestedBy.isBlank()) {
            return DEFAULT_ADMIN_USER;
        }
        return requestedBy.trim();
    }
}
