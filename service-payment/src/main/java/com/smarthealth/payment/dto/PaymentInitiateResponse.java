package com.smarthealth.payment.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class PaymentInitiateResponse {
    private String orderId;
    private String merchantId;
    private String payhereUrl;
    private BigDecimal amount;
    private String currency;
    private String hash;
    private String itemDescription;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String notifyUrl;
    private String returnUrl;
    private String cancelUrl;
}