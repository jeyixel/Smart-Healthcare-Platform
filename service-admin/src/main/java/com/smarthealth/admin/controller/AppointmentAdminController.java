package com.smarthealth.admin.controller;

import com.smarthealth.admin.dto.AppointmentResponse;
import com.smarthealth.admin.dto.UpdateAppointmentStatusRequest;
import com.smarthealth.admin.service.AppointmentAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/appointments")
@RequiredArgsConstructor
public class AppointmentAdminController {

    private final AppointmentAdminService appointmentService;

    @GetMapping
    public List<AppointmentResponse> getAll(@RequestHeader("Authorization") String token) {
        return appointmentService.getAllAppointments(token);
    }

    @PatchMapping("/{id}/status")
    public AppointmentResponse updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateAppointmentStatusRequest request,
            @RequestHeader("Authorization") String token
    ) {
        return appointmentService.updateStatus(id, request, token);
    }
}
