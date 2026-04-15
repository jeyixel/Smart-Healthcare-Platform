package com.smarthealth.payment.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class PaymentInitiateRequest {

    @NotNull(message = "Appointment ID is required")
    private Long appointmentId;

    @NotBlank(message = "Patient ID is required")
    private String patientId;

    @NotBlank(message = "Patient email is required")
    @Email(message = "Invalid email format")
    private String patientEmail;

    @NotBlank(message = "Patient phone is required")
    private String patientPhone;

    @NotBlank(message = "First name is required")
    private String patientFirstName;

    @NotBlank(message = "Last name is required")
    private String patientLastName;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;

    @NotBlank(message = "Item description is required")
    private String itemDescription;
}