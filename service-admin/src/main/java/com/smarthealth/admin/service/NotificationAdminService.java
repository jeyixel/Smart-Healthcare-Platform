package com.smarthealth.admin.service;

import com.smarthealth.admin.dto.EmailRequest;
import com.smarthealth.admin.dto.NotificationLogResponse;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

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

    public List<NotificationLogResponse> getRecentLogs(String token) {
        try {
            // The notification service returns a Spring Data Page object.
            // We'll fetch it and extract the 'content' list.
            Map<String, Object> response = notificationRestClient.get()
                    .uri("/api/v1/notifications/logs?size=10&sort=sentAt,desc")
                    .header("Authorization", token)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});

            if (response != null && response.containsKey("content")) {
                List<Map<String, Object>> content = (List<Map<String, Object>>) response.get("content");
                return content.stream().map(map -> new NotificationLogResponse(
                        ((Number) map.get("id")).longValue(),
                        (String) map.get("recipient"),
                        (String) map.get("subject"),
                        (String) map.get("message"),
                        (String) map.get("channel"),
                        (String) map.get("status"),
                        (String) map.get("errorMessage"),
                        java.time.LocalDateTime.parse((String) map.get("sentAt"))
                )).toList();
            }
            return List.of();
        } catch (Exception e) {
            System.err.println("Failed to fetch notification logs: " + e.getMessage());
            return List.of();
        }
    }
}
