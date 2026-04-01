package com.smarthealth.notification.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
public class NotifyLkConfig {

    @Value("${notify.lk.user.id}")
    private String userId;

    @Value("${notify.lk.api.key}")
    private String apiKey;

    @Value("${notify.lk.sender.id}")
    private String senderId;
}