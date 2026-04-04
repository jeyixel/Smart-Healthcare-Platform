package com.smarthealth.admin.repository;

import com.smarthealth.admin.model.AdminActionLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AdminActionLogRepository extends JpaRepository<AdminActionLog, UUID> {
}
