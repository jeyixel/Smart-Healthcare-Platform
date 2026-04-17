package com.smarthealth.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentAnalysisResponse {
    private BigDecimal totalRevenue;
    private long totalTransactions;
    private double successRate;
    private Map<String, Long> statusBreakdown;
    private List<DailyRevenue> trends;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyRevenue {
        private String date;
        private BigDecimal revenue;
    }
}
