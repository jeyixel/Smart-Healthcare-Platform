package com.smarthealth.appointment.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePaymentStatusDto {
    @NotBlank
    private String appointmentId;

    @NotBlank
    private String paymentStatus;
}

