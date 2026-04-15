package com.smarthealth.payment.dto;

import lombok.Data;

@Data
public class PayhereNotifyRequest {
    private String merchant_id;
    private String order_id;
    private String payment_id;
    private String payhere_amount;
    private String payhere_currency;
    private String status_code;
    private String md5sig;
    private String method;
    private String status_message;
}