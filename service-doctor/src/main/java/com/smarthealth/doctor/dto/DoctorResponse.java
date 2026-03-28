package com.smarthealth.doctor.dto;

import com.smarthealth.doctor.entity.ConsultationMode;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record DoctorResponse(
        UUID id,
        UUID userId,
        String fullName,
        String email,
        String phone,
        String specialty,
        String category,
        String qualification,
        Integer experienceYears,
        String hospitalOrClinic,
        BigDecimal consultationFee,
        ConsultationMode consultationMode,
        String bio,
        String profileImageUrl,
        String licenseNumber,
        boolean verified,
        boolean active,
        List<DoctorAvailabilityResponse> availabilities,
        Instant createdAt,
        Instant updatedAt
) {}
