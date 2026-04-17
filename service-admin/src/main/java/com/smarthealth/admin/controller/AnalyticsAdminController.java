package com.smarthealth.admin.controller;

import com.smarthealth.admin.dto.DashboardSummaryResponse;
import com.smarthealth.admin.dto.SystemEventResponse;
import com.smarthealth.admin.service.AnalyticsAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/analytics")
@RequiredArgsConstructor
public class AnalyticsAdminController {

    private final AnalyticsAdminService analyticsService;

    @GetMapping("/dashboard-summary")
    public DashboardSummaryResponse getSummary(@RequestHeader("Authorization") String token) {
        return analyticsService.getDashboardSummary(token);
    }

    @GetMapping("/recent-events")
    public List<SystemEventResponse> getRecentEvents() {
        return analyticsService.getRecentEvents();
    }

    @GetMapping("/payment-analysis")
    public com.smarthealth.admin.dto.PaymentAnalysisResponse getPaymentAnalysis(@RequestHeader("Authorization") String token) {
        return analyticsService.getPaymentAnalysis(token);
    }
}
