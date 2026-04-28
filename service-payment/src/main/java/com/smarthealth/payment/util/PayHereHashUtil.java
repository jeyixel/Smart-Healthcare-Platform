package com.smarthealth.payment.util;

import java.math.BigDecimal;
import java.security.MessageDigest;

public class PayHereHashUtil {

    public static String generateHash(
            String merchantId,
            String orderId,
            BigDecimal amount,
            String currency,
            String merchantSecret
    ) {
        try {
            String formattedAmount = String.format("%.2f", amount);
            String secretHash = md5(merchantSecret).toUpperCase();
            String rawHash = merchantId + orderId + formattedAmount + currency + secretHash;
            return md5(rawHash).toUpperCase();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PayHere hash", e);
        }
    }

    private static String md5(String input) throws Exception {
        MessageDigest md = MessageDigest.getInstance("MD5");
        byte[] messageDigest = md.digest(input.getBytes("UTF-8"));
        StringBuilder sb = new StringBuilder();
        for (byte b : messageDigest) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
