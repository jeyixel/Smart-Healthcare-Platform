package com.smarthealth.admin.dto;

import lombok.Builder;

@Builder
public record DoctorApprovalResponse(
        Long id,
        String email,
        String firstName,
        String lastName,
        String role,
        Boolean approved
) {
}
