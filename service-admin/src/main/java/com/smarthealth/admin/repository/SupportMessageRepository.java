package com.smarthealth.admin.repository;

import com.smarthealth.admin.model.SupportMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportMessageRepository extends JpaRepository<SupportMessage, Long> {
    
    @Query("SELECT m FROM SupportMessage m WHERE " +
           "(m.senderEmail = :email1 AND m.recipientEmail = :email2) OR " +
           "(m.senderEmail = :email2 AND m.recipientEmail = :email1) " +
           "ORDER BY m.timestamp ASC")
    List<SupportMessage> findChatHistory(@Param("email1") String email1, @Param("email2") String email2);

    @Query("SELECT DISTINCT m.senderEmail FROM SupportMessage m WHERE m.recipientEmail = :adminEmail")
    List<String> findUniqueSendersToAdmin(@Param("adminEmail") String adminEmail);

    long countByRecipientEmailAndReadFalse(String recipientEmail);
}
