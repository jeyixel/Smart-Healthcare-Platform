package com.smarthealth.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentEventDto {
    private String orderId;
    private Long appointmentId;
    private String patientId;
    private String patientEmail;
    private String patientPhone;
    private String patientFirstName;
    private String patientLastName;
    private BigDecimal amount;
    private String currency;
    private String status;      // SUCCESS, FAILED, CANCELLED
    private String itemDescription;
}