package com.smarthealth.admin.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "notification.service")
public class NotificationServiceProperties {
    private String url;
}
