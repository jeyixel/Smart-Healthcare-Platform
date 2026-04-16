package com.smarthealth.notification.service;

import com.smarthealth.notification.dto.EmailRequest;
import com.smarthealth.notification.entity.NotificationLog;
import com.smarthealth.notification.enums.NotificationStatus;
import com.smarthealth.notification.enums.NotificationType;
import com.smarthealth.notification.repository.NotificationLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final NotificationLogRepository logRepository;

    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 2000), retryFor = MailException.class)
    public void sendEmail(EmailRequest request, String eventType) {
        log.info("Attempting to send email to {} for event: {}", request.getTo(), eventType);
        
        NotificationLog logEntry = NotificationLog.builder()
                .recipient(request.getTo())
                .subject(request.getSubject())
                .message(request.getBody())
                .channel(NotificationType.EMAIL)
                .eventType(eventType)
                .status(NotificationStatus.PENDING)
                .build();

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(request.getTo());
            message.setSubject(request.getSubject());
            message.setText(request.getBody());
            mailSender.send(message);

            logEntry.setStatus(NotificationStatus.SENT);
            logRepository.save(logEntry);
            log.info("Email sent successfully to {}", request.getTo());

        } catch (MailException e) {
            logEntry.setStatus(NotificationStatus.FAILED);
            logEntry.setErrorMessage(e.getMessage());
            logRepository.save(logEntry);
            log.error("Failed attempt to send email to {}: {}", request.getTo(), e.getMessage());
            throw e; // Re-throw to trigger @Retryable
        }
    }
}