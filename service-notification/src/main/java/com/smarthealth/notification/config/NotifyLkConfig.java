package com.smarthealth.notification.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
public class NotifyLkConfig {

    @Value("${notifylk.user.id:${notify.lk.user.id}}")
    private String userId;

    @Value("${notifylk.api.key:${notify.lk.api.key}}")
    private String apiKey;

    @Value("${notifylk.sender.id:${notify.lk.sender.id}}")
    private String senderId;
}