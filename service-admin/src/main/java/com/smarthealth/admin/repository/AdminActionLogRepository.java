package com.smarthealth.admin.repository;

import com.smarthealth.admin.model.AdminActionLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AdminActionLogRepository extends JpaRepository<AdminActionLog, UUID> {
    List<AdminActionLog> findTop10ByOrderByCreatedAtDesc();
}
