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
    private String patientName;
    private String doctorName;
    private String appointmentDate;
    private String transactionId;
    private BigDecimal amount;
    private String currency;
    private String status;
    private String itemDescription;
}
