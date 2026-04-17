package com.smarthealth.notification.repository;

import com.smarthealth.notification.entity.NotificationLog;
import com.smarthealth.notification.enums.NotificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {
    List<NotificationLog> findByRecipient(String recipient);
    List<NotificationLog> findByStatus(NotificationStatus status);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM NotificationLog n WHERE n.sentAt IS NULL")
    void deleteBySentAtIsNull();

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM notification_service.notification_logs WHERE sent_at < '1980-01-01'", nativeQuery = true)
    void deleteEpochZeroRecords();
}