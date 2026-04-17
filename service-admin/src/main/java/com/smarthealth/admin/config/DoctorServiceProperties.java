package com.smarthealth.admin.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "doctor.service")
public class DoctorServiceProperties {
    private String baseUrl;
    private Endpoints endpoints = new Endpoints();

    @Data
    public static class Endpoints {
        private String base;
    }
}
