package com.smarthealth.admin.dto;

import java.time.LocalDateTime;

public record NotificationLogResponse(
    Long id,
    String recipient,
    String subject,
    String message,
    String channel,
    String status,
    String errorMessage,
    LocalDateTime sentAt
) {}
