package com.smarthealth.doctor.dto;

import com.smarthealth.doctor.entity.ConsultationMode;

import java.math.BigDecimal;
import java.util.UUID;

public record DoctorSearchResponse(
        UUID id,
        String fullName,
        String specialty,
        String category,
        String qualification,
        Integer experienceYears,
        String hospitalOrClinic,
        BigDecimal consultationFee,
        ConsultationMode consultationMode,
        boolean verified,
        boolean active,
        String profileImageUrl
) {}
