package com.smarthealth.admin.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "payment.service")
public class PaymentServiceProperties {
    private String baseUrl;
    private Endpoints endpoints = new Endpoints();

    @Data
    public static class Endpoints {
        private String base = "/api/payments";
    }
}
