package com.smarthealth.notification.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PaymentEventDto {
    private String orderId;
    private String appointmentId;
    private String patientId;
    private String patientEmail;
    private String patientPhone;
    private String patientFirstName;
    private String patientLastName;
    private BigDecimal amount;
    private String currency;
    private String status;
    private String itemDescription;
}
