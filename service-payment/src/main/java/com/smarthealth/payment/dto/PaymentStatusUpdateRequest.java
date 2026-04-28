package com.smarthealth.payment.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PaymentStatusUpdateRequest {
    private String status;
    private String transactionId;
    private BigDecimal amount;
}
