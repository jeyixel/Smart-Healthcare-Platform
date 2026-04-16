package com.smarthealth.appointment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentCompletedEventDto {
    private String appointmentId;
    private String patientId;
    private BigDecimal amount;
    private String paymentStatus; // "SUCCESS" or "FAILED"
    private String paymentReference;
}
