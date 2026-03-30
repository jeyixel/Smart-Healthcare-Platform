package com.smarthealth.notification.service;

import com.smarthealth.notification.config.TwilioConfig;
import com.smarthealth.notification.dto.SmsRequest;
import com.smarthealth.notification.entity.NotificationLog;
import com.smarthealth.notification.enums.NotificationStatus;
import com.smarthealth.notification.enums.NotificationType;
import com.smarthealth.notification.repository.NotificationLogRepository;
import com.twilio.exception.ApiException;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class SmsService {

    private final TwilioConfig twilioConfig;
    private final NotificationLogRepository logRepository;

    public NotificationLog sendSms(SmsRequest request) {
        NotificationLog logEntry = NotificationLog.builder()
                .recipient(request.getTo())
                .subject("SMS Notification")
                .message(request.getMessage())
                .type(NotificationType.SMS)
                .status(NotificationStatus.PENDING)
                .build();

        try {
            Message message = Message.creator(
                    new PhoneNumber(request.getTo()),
                    new PhoneNumber(twilioConfig.getPhoneNumber()),
                    request.getMessage()
            ).create();

            logEntry.setStatus(NotificationStatus.SENT);
            log.info("SMS sent to {}. SID: {}", request.getTo(), message.getSid());

        } catch (ApiException e) {
            logEntry.setStatus(NotificationStatus.FAILED);
            logEntry.setErrorMessage(e.getMessage());
            log.error("Failed to send SMS to {}: {}", request.getTo(), e.getMessage());
        }

        return logRepository.save(logEntry);
    }
}