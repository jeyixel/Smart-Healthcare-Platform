package com.smarthealth.patient.controller;

import com.smarthealth.patient.dto.PatientEventDto;
import com.smarthealth.patient.service.PatientEventConsumerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/patient-events")
public class PatientEventController {

    private final PatientEventConsumerService patientEventConsumerService;

    public PatientEventController(PatientEventConsumerService patientEventConsumerService) {
        this.patientEventConsumerService = patientEventConsumerService;
    }

    @GetMapping
    public ResponseEntity<List<PatientEventDto>> getConsumedEvents() {
        return ResponseEntity.ok(patientEventConsumerService.getReceivedEvents());
    }

    @DeleteMapping
    public ResponseEntity<Void> clearConsumedEvents() {
        patientEventConsumerService.clearReceivedEvents();
        return ResponseEntity.noContent().build();
    }
}
