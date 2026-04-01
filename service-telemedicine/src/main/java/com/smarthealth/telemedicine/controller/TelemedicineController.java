package com.smarthealth.telemedicine.controller;

import com.smarthealth.telemedicine.model.TelemedicineSession;
import com.smarthealth.telemedicine.service.TelemedicineService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/telemedicine/sessions")
@CrossOrigin(origins = "*") // Allows your frontend to call this API later without CORS blocking
public class TelemedicineController {

    private static final Logger logger = LoggerFactory.getLogger(TelemedicineController.class);

    private final TelemedicineService service;

    public TelemedicineController(TelemedicineService service) {
        this.service = service;
    }

    // Endpoint to generate a new meeting link (Will be called by Appointment Service)
    @PostMapping
    public ResponseEntity<?> createSession(@RequestBody Map<String, String> requestData) {

        // Validate each field individually with specific error messages
        String appointmentId = requestData.get("appointmentId");
        String patientId     = requestData.get("patientId");
        String doctorId      = requestData.get("doctorId");

        Map<String, String> errors = new LinkedHashMap<>();

        if (appointmentId == null || appointmentId.isBlank()) {
            errors.put("appointmentId", "appointmentId is missing or empty");
        }
        if (patientId == null || patientId.isBlank()) {
            errors.put("patientId", "patientId is missing or empty");
        }
        if (doctorId == null || doctorId.isBlank()) {
            errors.put("doctorId", "doctorId is missing or empty");
        }

        // Return all validation errors at once so the caller can fix everything in one go
        if (!errors.isEmpty()) {
            Map<String, Object> errorResponse = new LinkedHashMap<>();
            errorResponse.put("status",  400);
            errorResponse.put("error",   "Bad Request");
            errorResponse.put("message", "One or more required fields are missing or empty");
            errorResponse.put("fields",  errors);
            errorResponse.put("timestamp", Instant.now().toString());

            return ResponseEntity.badRequest().body(errorResponse);
        }

        try {
            // If validation passed, attempt to create the session
            TelemedicineSession session = service.createSession(appointmentId, patientId, doctorId);
            return ResponseEntity.ok(session);

        } catch (EntityNotFoundException e) {
            // e.g. appointment / patient / doctor not found in the DB
            Map<String, Object> errorResponse = new LinkedHashMap<>();
            errorResponse.put("status",    404);
            errorResponse.put("error",     "Not Found");
            errorResponse.put("message",   e.getMessage());
            errorResponse.put("timestamp", Instant.now().toString());

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);

        } catch (Exception e) {
            // Catch-all so unexpected failures still return a useful message
            Map<String, Object> errorResponse = new LinkedHashMap<>();
            errorResponse.put("status",    500);
            errorResponse.put("error",     "Internal Server Error");
            errorResponse.put("message",   "An unexpected error occurred while creating the session");
            errorResponse.put("detail",    e.getMessage());   // safe for internal/dev use
            errorResponse.put("timestamp", Instant.now().toString());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Endpoint to retrieve a meeting link (Will be called by Frontend when clicking "Join Call")
    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<TelemedicineSession> getSession(@PathVariable String appointmentId) {
        Optional<TelemedicineSession> session = service.getSessionByAppointment(appointmentId);
        return session.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build()); // Return 404 if not found
    }

    // Endpoint to mark a session as completed
    @PatchMapping("/{sessionId}/status")
    public ResponseEntity<?> completeSession(@PathVariable UUID sessionId, HttpServletRequest request) {
        logger.info("Attempting to mark telemedicine session as COMPLETED. sessionId={}", sessionId);

        try {
            Optional<TelemedicineSession> sessionOpt = service.getSessionById(sessionId);

            if (sessionOpt.isPresent()) {
                TelemedicineSession session = sessionOpt.get();
                session.setStatus("COMPLETED");

                // Save the updated status back to the database
                TelemedicineSession updatedSession = service.updateSession(session);
                logger.info("Successfully marked telemedicine session as COMPLETED. sessionId={}", sessionId);

                return ResponseEntity.ok(updatedSession);
            }

            logger.warn("Telemedicine session not found while attempting status update. sessionId={}", sessionId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(buildErrorResponse(
                            404,
                            "Not Found",
                            "Telemedicine session was not found",
                            sessionId,
                            request,
                            null
                    ));

        } catch (IllegalArgumentException e) {
            logger.warn("Invalid session ID passed to completeSession. sessionId={}", sessionId, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(buildErrorResponse(
                            400,
                            "Bad Request",
                            "Invalid session ID",
                            sessionId,
                            request,
                            e.getMessage()
                    ));

        } catch (Exception e) {
            logger.error("Unexpected error while completing telemedicine session. sessionId={}", sessionId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(buildErrorResponse(
                            500,
                            "Internal Server Error",
                            "An unexpected error occurred while updating telemedicine session status",
                            sessionId,
                            request,
                            e.getMessage()
                    ));
        }
    }

    private Map<String, Object> buildErrorResponse(int status,
                                                   String error,
                                                   String message,
                                                   UUID sessionId,
                                                   HttpServletRequest request,
                                                   String detail) {
        Map<String, Object> errorResponse = new LinkedHashMap<>();
        errorResponse.put("status", status);
        errorResponse.put("error", error);
        errorResponse.put("message", message);
        errorResponse.put("sessionId", String.valueOf(sessionId));
        errorResponse.put("path", request.getRequestURI());
        errorResponse.put("timestamp", Instant.now().toString());

        if (detail != null && !detail.isBlank()) {
            errorResponse.put("detail", detail);
        }

        return errorResponse;
    }
}