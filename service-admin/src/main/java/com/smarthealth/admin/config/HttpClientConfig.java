package com.smarthealth.admin.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
@EnableConfigurationProperties({
    PatientServiceProperties.class, 
    NotificationServiceProperties.class, 
    AppointmentServiceProperties.class,
    PaymentServiceProperties.class,
    DoctorServiceProperties.class
})
public class HttpClientConfig {

    @Bean
    RestClient patientRestClient(PatientServiceProperties properties) {
        return RestClient.builder()
                .baseUrl(properties.getBaseUrl())
                .build();
    }

    @Bean
    RestClient notificationRestClient(NotificationServiceProperties properties) {
        return RestClient.builder()
                .baseUrl(properties.getUrl())
                .build();
    }

    @Bean
    RestClient appointmentRestClient(AppointmentServiceProperties properties) {
        return RestClient.builder()
                .baseUrl(properties.getBaseUrl())
                .build();
    }

    @Bean
    RestClient paymentRestClient(PaymentServiceProperties properties) {
        return RestClient.builder()
                .baseUrl(properties.getBaseUrl())
                .build();
    }

    @Bean
    RestClient doctorRestClient(DoctorServiceProperties properties) {
        return RestClient.builder()
                .baseUrl(properties.getBaseUrl())
                .build();
    }
}
