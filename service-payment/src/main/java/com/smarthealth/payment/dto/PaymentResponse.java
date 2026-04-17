package com.smarthealth.payment.dto;

import com.smarthealth.payment.enums.PaymentStatus;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PaymentResponse {
    private Long id;
    private String orderId;
    private java.util.UUID appointmentId;
    private String patientId;
    private BigDecimal amount;
    private String currency;
    private PaymentStatus status;
    private String payherePaymentId;
    private String itemDescription;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}