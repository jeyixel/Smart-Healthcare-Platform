package com.smarthealth.admin.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardSummaryResponse {
    private long totalPatients;
    private long activeDoctors;
    private long totalAppointments;
    private long totalSystemUsers;
}
