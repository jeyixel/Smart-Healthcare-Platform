package com.smarthealth.notification.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SmsRequest {

    @NotBlank(message = "Phone number is required")
    private String to; // e.g. 0771234567 or 94771234567

    @NotBlank(message = "Message is required")
    private String message;
}