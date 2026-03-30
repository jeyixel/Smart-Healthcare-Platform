package com.smarthealth.notification.repository;

import com.smarthealth.notification.entity.NotificationLog;
import com.smarthealth.notification.enums.NotificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {
    List<NotificationLog> findByRecipient(String recipient);
    List<NotificationLog> findByStatus(NotificationStatus status);
}