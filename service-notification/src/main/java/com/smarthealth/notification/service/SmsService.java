package com.smarthealth.notification.service;

import com.smarthealth.notification.config.NotifyLkConfig;
import com.smarthealth.notification.dto.SmsRequest;
import com.smarthealth.notification.entity.NotificationLog;
import com.smarthealth.notification.enums.NotificationStatus;
import com.smarthealth.notification.enums.NotificationType;
import com.smarthealth.notification.repository.NotificationLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
@RequiredArgsConstructor
@Slf4j
public class SmsService {

    private final NotifyLkConfig notifyLkConfig;
    private final NotificationLogRepository logRepository;
    private final RestTemplate restTemplate;

    private static final String NOTIFY_LK_URL = "https://app.notify.lk/api/v1/send";

    public NotificationLog sendSms(SmsRequest request) {
        NotificationLog logEntry = NotificationLog.builder()
                .recipient(request.getTo())
                .subject("SMS Notification")
                .message(request.getMessage())
                .type(NotificationType.SMS)
                .status(NotificationStatus.PENDING)
                .build();

        try {
            String url = UriComponentsBuilder.fromHttpUrl(NOTIFY_LK_URL)
                    .queryParam("user_id", notifyLkConfig.getUserId())
                    .queryParam("api_key", notifyLkConfig.getApiKey())
                    .queryParam("sender_id", notifyLkConfig.getSenderId())
                    .queryParam("to", request.getTo())
                    .queryParam("message", request.getMessage())
                    .toUriString();

            String response = restTemplate.getForObject(url, String.class);
            log.info("Notify.lk response: {}", response);

            logEntry.setStatus(NotificationStatus.SENT);
            log.info("SMS sent successfully to {}", request.getTo());

        } catch (Exception e) {
            logEntry.setStatus(NotificationStatus.FAILED);
            logEntry.setErrorMessage(e.getMessage());
            log.error("Failed to send SMS to {}: {}", request.getTo(), e.getMessage());
        }

        return logRepository.save(logEntry);
    }
}