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
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final NotificationLogRepository logRepository;

    public NotificationLog sendEmail(EmailRequest request) {
        NotificationLog logEntry = NotificationLog.builder()
                .recipient(request.getTo())
                .subject(request.getSubject())
                .message(request.getBody())
                .type(NotificationType.EMAIL)
                .status(NotificationStatus.PENDING)
                .build();

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(request.getTo());
            message.setSubject(request.getSubject());
            message.setText(request.getBody());
            mailSender.send(message);

            logEntry.setStatus(NotificationStatus.SENT);
            log.info("Email sent successfully to {}", request.getTo());

        } catch (MailException e) {
            logEntry.setStatus(NotificationStatus.FAILED);
            logEntry.setErrorMessage(e.getMessage());
            log.error("Failed to send email to {}: {}", request.getTo(), e.getMessage());
        }

        return logRepository.save(logEntry);
    }
}