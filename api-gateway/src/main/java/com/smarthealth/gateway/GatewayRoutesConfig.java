package com.smarthealth.gateway;

import static org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions.route;
import static org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions.http;
import static org.springframework.cloud.gateway.server.mvc.filter.BeforeFilterFunctions.uri;
import static org.springframework.cloud.gateway.server.mvc.predicate.GatewayRequestPredicates.path;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

@Configuration
public class GatewayRoutesConfig {

    @Value("${PATIENT_SERVICE_URL:http://localhost:8081}")
    private String patientServiceUrl;

    @Value("${ADMIN_SERVICE_URL:http://localhost:8087}")
    private String adminServiceUrl;

    @Value("${AUTH_SERVICE_URL:http://localhost:8087}")
    private String authServiceUrl;

    @Value("${DOCTOR_SERVICE_URL:http://localhost:8082}")
    private String doctorServiceUrl;

    @Value("${APPOINTMENT_SERVICE_URL:http://localhost:8083}")
    private String appointmentServiceUrl;

    @Value("${PRESCRIPTION_SERVICE_URL:http://localhost:8088}")
    private String prescriptionServiceUrl;

    @Value("${TELEMEDICINE_SERVICE_URL:http://localhost:8085}")
    private String telemedicineServiceUrl;

    @Bean
    RouterFunction<ServerResponse> patientRoute() {
        return route("patient-service")
                .before(uri(patientServiceUrl))
                .route(path("/api/v1/patients/**"), http())
                .build();
    }

    @Bean
    RouterFunction<ServerResponse> adminRoute() {
        return route("admin-service")
                .before(uri(adminServiceUrl))
                .route(path("/api/v1/admin/**"), http())
                .build();
    }

    @Bean
    RouterFunction<ServerResponse> authRoute() {
        return route("auth-service")
                .before(uri(authServiceUrl))
                .route(path("/api/v1/auth/**"), http())
                .build();
    }

    @Bean
    RouterFunction<ServerResponse> doctorRoute() {
        return route("doctor-service")
                .before(uri(doctorServiceUrl))
                .route(path("/api/v1/doctors/**"), http())
                .build();
    }

    @Bean
    RouterFunction<ServerResponse> appointmentRoute() {
        return route("appointment-service")
                .before(uri(appointmentServiceUrl))
                .route(path("/api/v1/appointments/**"), http())
                .build();
    }

    @Bean
    RouterFunction<ServerResponse> prescriptionRoute() {
        return route("prescription-service")
                .before(uri(prescriptionServiceUrl))
                .route(path("/api/v1/prescriptions/**"), http())
                .build();
    }

    @Bean
    RouterFunction<ServerResponse> telemedicineRoute() {
        return route("telemedicine-service")
                .before(uri(telemedicineServiceUrl))
                .route(path("/api/v1/telemedicine/**", "/api/telemedicine/**"), http())
                .build();
    }

    @Value("${NOTIFICATION_SERVICE_URL:http://localhost:8086}")
    private String notificationServiceUrl;

    @Bean
    RouterFunction<ServerResponse> notificationRoute() {
        return route("notification-service")
                .before(uri(notificationServiceUrl))
                .route(path("/api/v1/notifications/**", "/api/notifications/**"), http())
                .build();
    }
}
