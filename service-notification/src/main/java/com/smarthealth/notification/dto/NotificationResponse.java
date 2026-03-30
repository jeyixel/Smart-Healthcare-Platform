package com.smarthealth.notification.dto;

import com.smarthealth.notification.enums.NotificationStatus;
import com.smarthealth.notification.enums.NotificationType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {
    private Long id;
    private String recipient;
    private String subject;
    private NotificationType type;
    private NotificationStatus status;
    private String errorMessage;
    private LocalDateTime sentAt;
}