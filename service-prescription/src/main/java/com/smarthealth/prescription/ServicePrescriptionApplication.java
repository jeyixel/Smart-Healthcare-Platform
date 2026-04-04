package com.smarthealth.prescription;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class ServicePrescriptionApplication {

    public static void main(String[] args) {
        SpringApplication.run(ServicePrescriptionApplication.class, args);
    }

}
