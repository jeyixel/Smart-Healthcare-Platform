package com.smarthealth.admin.service;

import com.smarthealth.admin.dto.PrescriptionSnapshotUpsertRequest;
import com.smarthealth.admin.model.AdminActionLog;
import com.smarthealth.admin.repository.AdminActionLogRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AdminAuditService {

    private static final String DEFAULT_ADMIN_USER = "system-admin";

    private final AdminActionLogRepository adminActionLogRepository;

    public AdminAuditService(AdminActionLogRepository adminActionLogRepository) {
        this.adminActionLogRepository = adminActionLogRepository;
    }

    public void logPatientStatusChange(UUID patientId, boolean active, String requestedBy) {
        AdminActionLog log = new AdminActionLog();
        log.setActionType("PATIENT_STATUS_UPDATED");
        log.setTargetType("PATIENT");
        log.setTargetId(patientId);
        log.setRequestedBy(normalizeRequestedBy(requestedBy));
        log.setDetails("active=" + active);
        adminActionLogRepository.save(log);
    }

    public void logPrescriptionUpsert(PrescriptionSnapshotUpsertRequest request, String requestedBy) {
        AdminActionLog log = new AdminActionLog();
        log.setActionType("PRESCRIPTION_SNAPSHOT_UPSERTED");
        log.setTargetType("PATIENT");
        log.setTargetId(request.getPatientId());
        log.setRequestedBy(normalizeRequestedBy(requestedBy));
        log.setDetails("externalPrescriptionId=" + request.getExternalPrescriptionId() + ",status=" + request.getStatus());
        adminActionLogRepository.save(log);
    }

    private String normalizeRequestedBy(String requestedBy) {
        if (requestedBy == null || requestedBy.isBlank()) {
            return DEFAULT_ADMIN_USER;
        }
        return requestedBy.trim();
    }
}
