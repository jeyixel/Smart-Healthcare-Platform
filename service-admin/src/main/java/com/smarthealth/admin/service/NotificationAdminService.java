package com.smarthealth.admin.service;

import com.smarthealth.admin.dto.EmailRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class NotificationAdminService {

    private final RestClient notificationRestClient;

    public NotificationAdminService(RestClient notificationRestClient) {
        this.notificationRestClient = notificationRestClient;
    }

    public void sendWelcomeEmail(String recipientEmail, String firstName) {
        try {
            EmailRequest request = EmailRequest.builder()
                    .to(recipientEmail)
                    .subject("Welcome to SmartHealth!")
                    .body("Dear " + firstName + ",\n\n"
                            + "Welcome to the Smart Healthcare Platform! Your account has been successfully created.\n"
                            + "You can now book appointments, view your health records, and receive real-time updates.\n\n"
                            + "Regards,\nSmartHealth Team")
                    .build();

            notificationRestClient.post()
                    .uri("/api/notifications/email")
                    .body(request)
                    .retrieve()
                    .toBodilessEntity();
            
            System.out.println("Welcome notification sent to: " + recipientEmail);
        } catch (Exception e) {
            // Log error but don't fail registration
            System.err.println("Failed to send welcome notification: " + e.getMessage());
        }
    }
}
