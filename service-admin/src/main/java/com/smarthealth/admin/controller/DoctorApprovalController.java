package com.smarthealth.admin.controller;

import com.smarthealth.admin.dto.DoctorApprovalResponse;
import com.smarthealth.admin.model.Role;
import com.smarthealth.admin.model.User;
import com.smarthealth.admin.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/doctors")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class DoctorApprovalController {

    private final UserRepository userRepository;

    @GetMapping("/pending")
    public ResponseEntity<List<DoctorApprovalResponse>> getPendingDoctors() {
        List<DoctorApprovalResponse> pending = userRepository.findByRoleAndApproved(Role.DOCTOR, false)
                .stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(pending);
    }

    @PatchMapping("/{doctorId}/approve")
    public ResponseEntity<DoctorApprovalResponse> approveDoctor(@PathVariable Long doctorId) {
        User doctor = userRepository.findByIdAndRole(doctorId, Role.DOCTOR)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor account not found"));

        doctor.setApproved(true);
        User saved = userRepository.save(doctor);
        return ResponseEntity.ok(toResponse(saved));
    }

    private DoctorApprovalResponse toResponse(User user) {
        return DoctorApprovalResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole() == null ? null : user.getRole().name())
                .approved(user.getApproved())
                .build();
    }
}
