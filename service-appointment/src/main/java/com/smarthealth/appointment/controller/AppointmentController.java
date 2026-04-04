package com.smarthealth.appointment.controller;

import com.smarthealth.appointment.dto.*;
import com.smarthealth.appointment.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AppointmentResponse create(@Valid @RequestBody CreateAppointmentRequest request) {
        return appointmentService.create(request);
    }

    @GetMapping("/{id}")
    public AppointmentResponse getById(@PathVariable UUID id) {
        return appointmentService.getById(id);
    }

    @GetMapping
    public List<AppointmentResponse> getAll(
            @RequestParam(required = false) UUID patientId,
            @RequestParam(required = false) UUID doctorId,
            @RequestParam(required = false) String status
    ) {
        return appointmentService.getAll(patientId, doctorId, status);
    }

    @PatchMapping("/{id}/status")
    public AppointmentResponse updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateAppointmentStatusRequest request
    ) {
        return appointmentService.updateStatus(id, request);
    }

    @PatchMapping("/{id}/reschedule")
    public AppointmentResponse reschedule(
            @PathVariable UUID id,
            @Valid @RequestBody RescheduleAppointmentRequest request
    ) {
        return appointmentService.reschedule(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        appointmentService.delete(id);
    }
}
