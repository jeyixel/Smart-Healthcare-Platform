package com.smarthealth.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PayHereHashResponse {
    private String hash;
    private String merchantId;
    private String orderId;
    private String amount;
    private String currency;
}
