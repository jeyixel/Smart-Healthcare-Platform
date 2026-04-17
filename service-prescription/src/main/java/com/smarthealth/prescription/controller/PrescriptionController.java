package com.smarthealth.prescription.controller;

import com.smarthealth.prescription.dto.CreatePrescriptionRequest;
import com.smarthealth.prescription.dto.PrescriptionResponse;
import com.smarthealth.prescription.dto.UpdatePrescriptionRequest;
import com.smarthealth.prescription.dto.UpdatePrescriptionStatusRequest;
import com.smarthealth.prescription.service.PrescriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/prescriptions")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public PrescriptionResponse createPrescription(@Valid @RequestBody CreatePrescriptionRequest request) {
        return prescriptionService.createPrescription(request);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public PrescriptionResponse getById(@PathVariable UUID id) {
        return prescriptionService.getById(id);
    }

    @GetMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR') or hasRole('PATIENT')")
    public PrescriptionResponse getByAppointmentId(@PathVariable UUID appointmentId) {
        return prescriptionService.getByAppointmentId(appointmentId);
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR')")
    public List<PrescriptionResponse> getByPatientId(@PathVariable UUID patientId) {
        return prescriptionService.getByPatientId(patientId);
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('DOCTOR'))")
    public List<PrescriptionResponse> getByDoctorId(@PathVariable UUID doctorId) {
        return prescriptionService.getByDoctorId(doctorId);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('DOCTOR')")
    public PrescriptionResponse updatePrescription(@PathVariable UUID id,
                                                   @Valid @RequestBody UpdatePrescriptionRequest request) {
        return prescriptionService.updatePrescription(id, request);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('DOCTOR'))")
    public PrescriptionResponse updateStatus(@PathVariable UUID id,
                                             @Valid @RequestBody UpdatePrescriptionStatusRequest request) {
        return prescriptionService.updateStatus(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('DOCTOR'))")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePrescription(@PathVariable UUID id) {
        prescriptionService.deletePrescription(id);
    }
}
