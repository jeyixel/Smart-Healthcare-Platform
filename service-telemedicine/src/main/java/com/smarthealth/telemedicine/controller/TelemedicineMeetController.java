package com.smarthealth.telemedicine.controller;

import com.smarthealth.telemedicine.service.TelemedicineService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/telemedicine/meet")
@CrossOrigin(origins = "*")
public class TelemedicineMeetController {

    private static final Logger logger = LoggerFactory.getLogger(TelemedicineMeetController.class);

    private final TelemedicineService service;

    public TelemedicineMeetController(TelemedicineService service) {
        this.service = service;
    }

    @GetMapping("/token")
    public ResponseEntity<?> getJitsiToken(
            @RequestParam(value = "room", required = false, defaultValue = "*") String room,
            HttpServletRequest request) {

        // Extract the current user's identity from the request headers
        // (Assuming the API Gateway or local filter provides these)
        String userName = request.getHeader("X-User-Name");
        String userEmail = request.getHeader("X-User-Email");

        if (userName == null || userName.isBlank()) {
            userName = "Guest";
        }

        try {
            String token = service.generateJitsiToken(room, userName, userEmail);

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("token", token);
            response.put("room", room);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            logger.error("Configuration error while generating Jitsi token", e);
            return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Configuration Error", "JaaS settings are improperly configured.", e.getMessage());
        } catch (Exception e) {
            logger.error("Error generating Jitsi token", e);
            return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Token Generation Error", "An unexpected error occurred while generating meeting token.", e.getMessage());
        }
    }

    private ResponseEntity<Map<String, Object>> buildErrorResponse(HttpStatus status, String error, String message, String detail) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", status.value());
        body.put("error", error);
        body.put("message", message);
        if (detail != null) {
            body.put("detail", detail);
        }
        return ResponseEntity.status(status).body(body);
    }
}
