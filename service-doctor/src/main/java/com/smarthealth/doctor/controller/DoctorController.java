package com.smarthealth.doctor.controller;

import com.smarthealth.doctor.dto.*;
import com.smarthealth.doctor.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;


@RequiredArgsConstructor
@RequestMapping("/api/v1/doctors")
@RestController
public class DoctorController {
    private final DoctorService doctorService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DoctorResponse createDoctor(@Valid @RequestBody CreateDoctorRequest request) {
        return doctorService.createDoctor(request);
    }

    @GetMapping("/{id}")
    public DoctorResponse getDoctorById(@PathVariable UUID id) {
        return doctorService.getDoctorById(id);
    }

    @GetMapping("/user/{userId}")
    public DoctorResponse getDoctorByUserId(@PathVariable UUID userId) {
        return doctorService.getDoctorByUserId(userId);
    }

    @PutMapping("/{id}")
    public DoctorResponse updateDoctor(@PathVariable UUID id,
                                       @Valid @RequestBody UpdateDoctorRequest request) {
        return doctorService.updateDoctor(id, request);
    }

    @PatchMapping("/{id}/verify")
    public DoctorResponse verifyDoctor(@PathVariable UUID id,
                                       @RequestParam boolean verified) {
        return doctorService.verifyDoctor(id, verified);
    }

    @PatchMapping("/{id}/active")
    public DoctorResponse changeActiveStatus(@PathVariable UUID id,
                                             @RequestParam boolean active) {
        return doctorService.changeActiveStatus(id, active);
    }

    @PutMapping("/{id}/availability")
    public DoctorResponse replaceAvailability(@PathVariable UUID id,
                                              @Valid @RequestBody List<DoctorAvailabilityRequest> requests) {
        return doctorService.replaceAvailability(id, requests);
    }

    @GetMapping("/search")
    public List<DoctorSearchResponse> searchDoctors(
            @RequestParam(required = false) String specialty,
            @RequestParam(required = false) String category
    ) {
        return doctorService.searchDoctors(specialty, category);
    }

    @GetMapping
    public List<DoctorSearchResponse> listVerifiedActiveDoctors() {
        return doctorService.listVerifiedActiveDoctors();
    }
}
