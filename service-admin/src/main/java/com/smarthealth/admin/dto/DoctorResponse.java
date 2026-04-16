package com.smarthealth.admin.dto;

import java.util.UUID;

public record DoctorResponse(
        UUID id,
        String fullName
) {}
