package com.smarthealth.doctor.dto;

import com.smarthealth.doctor.entity.ConsultationMode;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record UpdateDoctorRequest(
        @NotBlank @Size(max = 150)
        String fullName,
        @NotBlank @Size(max = 20)
        String phone,
        @NotBlank @Size(max = 100)
        String specialty,
        @NotBlank @Size(max = 100)
        String category,
        @NotBlank @Size(max = 200)
        String qualification,
        @NotNull @Min(0) @Max(60)
        Integer experienceYears,
        @NotBlank @Size(max = 150)
        String hospitalOrClinic,
        @NotNull @DecimalMin("0.00")
        BigDecimal consultationFee,
        @NotNull
        ConsultationMode consultationMode,
        @Size(max = 1200)
        String bio,
        @Size(max = 500)
        String profileImageUrl
) {}
