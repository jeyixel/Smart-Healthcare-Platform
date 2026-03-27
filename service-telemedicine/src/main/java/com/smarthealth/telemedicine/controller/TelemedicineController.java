package com.smarthealth.telemedicine.controller;

import com.smarthealth.telemedicine.model.TelemedicineSession;
import com.smarthealth.telemedicine.service.TelemedicineService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<TelemedicineSession> createSession(@RequestBody Map<String, String> requestData) {
        String appointmentId = requestData.get("appointmentId");
        String patientId = requestData.get("patientId");
        String doctorId = requestData.get("doctorId");

        if (appointmentId == null || patientId == null || doctorId == null) {
            return ResponseEntity.badRequest().build(); // Return 400 if data is missing
        }

        TelemedicineSession session = service.createSession(appointmentId, patientId, doctorId);
        return ResponseEntity.ok(session); // Return 200 with the created session data
    }

    // Endpoint to retrieve a meeting link (Will be called by Frontend when clicking "Join Call")
    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<TelemedicineSession> getSession(@PathVariable String appointmentId) {
        Optional<TelemedicineSession> session = service.getSessionByAppointment(appointmentId);
        return session.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build()); // Return 404 if not found
    }
}