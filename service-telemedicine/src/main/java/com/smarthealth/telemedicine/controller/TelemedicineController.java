package com.smarthealth.telemedicine.controller;

import com.smarthealth.telemedicine.model.TelemedicineSession;
import com.smarthealth.telemedicine.service.TelemedicineService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/telemedicine/sessions")
@CrossOrigin(origins = "*") // Allows your frontend to call this API later without CORS blocking
public class TelemedicineController {

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
}