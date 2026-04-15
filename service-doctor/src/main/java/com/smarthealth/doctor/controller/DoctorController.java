package com.smarthealth.doctor.controller;

import com.smarthealth.doctor.dto.*;
import com.smarthealth.doctor.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
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
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR')")
    public DoctorResponse createDoctor(@Valid @RequestBody CreateDoctorRequest request) {
        return doctorService.createDoctor(request);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR') or hasRole('PATIENT')")
    public DoctorResponse getDoctorById(@PathVariable UUID id) {
        return doctorService.getDoctorById(id);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.userId")
    public DoctorResponse getDoctorByUserId(@PathVariable Long userId) {
        return doctorService.getDoctorByUserId(userId);
    }

    @PutMapping("/{id}")
    @PreAuthorize("(hasRole('DOCTOR') and @doctorService.isDoctorOwner(#id, authentication.principal.userId))")
    public DoctorResponse updateDoctor(@PathVariable UUID id,
                                       @Valid @RequestBody UpdateDoctorRequest request) {
        return doctorService.updateDoctor(id, request);
    }

    @PatchMapping("/{id}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    public DoctorResponse verifyDoctor(@PathVariable UUID id,
                                       @RequestParam boolean verified) {
        return doctorService.verifyDoctor(id, verified);
    }

    @PatchMapping("/{id}/active")
    @PreAuthorize("hasRole('DOCTOR')")
    public DoctorResponse changeActiveStatus(@PathVariable UUID id,
                                             @RequestParam boolean active) {
        return doctorService.changeActiveStatus(id, active);
    }

    @PutMapping("/{id}/availability")
    @PreAuthorize("(hasRole('DOCTOR') and @doctorService.isDoctorOwner(#id, authentication.principal.userId))")
    public DoctorResponse replaceAvailability(@PathVariable UUID id,
                                              @Valid @RequestBody List<DoctorAvailabilityRequest> requests) {
        return doctorService.replaceAvailability(id, requests);
    }


    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR') or hasRole('PATIENT')")
    public List<DoctorSearchResponse> searchDoctors(
            @RequestParam(required = false) String specialty,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String consultationMode
    ) {
        return doctorService.searchDoctors(specialty, category, consultationMode);
    }


    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR') or hasRole('PATIENT')")
    public List<DoctorSearchResponse> listVerifiedActiveDoctors() {
        return doctorService.listVerifiedActiveDoctors();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteDoctor(@PathVariable UUID id) {
        doctorService.deleteDoctor(id);
    }
}
