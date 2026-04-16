package com.smarthealth.admin.service;

import com.smarthealth.admin.config.AppointmentServiceProperties;
import com.smarthealth.admin.config.PatientServiceProperties;
import com.smarthealth.admin.config.PaymentServiceProperties;
import com.smarthealth.admin.dto.*;
import com.smarthealth.admin.model.Role;
import com.smarthealth.admin.repository.AdminActionLogRepository;
import com.smarthealth.admin.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsAdminService {

    private final RestClient patientRestClient;
    private final RestClient appointmentRestClient;
    private final RestClient paymentRestClient;
    private final PatientServiceProperties patientProperties;
    private final AppointmentServiceProperties appointmentProperties;
    private final PaymentServiceProperties paymentProperties;
    private final AdminActionLogRepository adminActionLogRepository;
    private final UserRepository userRepository;

    public PaymentAnalysisResponse getPaymentAnalysis() {
        List<ExternalPaymentResponse> payments = paymentRestClient.get()
                .uri(paymentProperties.getEndpoints().getBase())
                .retrieve()
                .body(new ParameterizedTypeReference<List<ExternalPaymentResponse>>() {});

        if (payments == null || payments.isEmpty()) {
            return PaymentAnalysisResponse.builder()
                    .totalRevenue(BigDecimal.ZERO)
                    .totalTransactions(0)
                    .successRate(0.0)
                    .statusBreakdown(Map.of())
                    .trends(List.of())
                    .build();
        }

        BigDecimal totalRevenue = payments.stream()
                .filter(p -> "SUCCESS".equalsIgnoreCase(p.getStatus()))
                .map(ExternalPaymentResponse::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long successfulCount = payments.stream()
                .filter(p -> "SUCCESS".equalsIgnoreCase(p.getStatus()))
                .count();

        Map<String, Long> statusBreakdown = payments.stream()
                .collect(Collectors.groupingBy(ExternalPaymentResponse::getStatus, Collectors.counting()));

        Map<String, BigDecimal> dailyRevenue = payments.stream()
                .filter(p -> "SUCCESS".equalsIgnoreCase(p.getStatus()))
                .collect(Collectors.groupingBy(
                        p -> p.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE),
                        Collectors.reducing(BigDecimal.ZERO, ExternalPaymentResponse::getAmount, BigDecimal::add)
                ));

        List<PaymentAnalysisResponse.DailyRevenue> trends = dailyRevenue.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> PaymentAnalysisResponse.DailyRevenue.builder()
                        .date(e.getKey())
                        .revenue(e.getValue())
                        .build())
                .collect(Collectors.toList());

        return PaymentAnalysisResponse.builder()
                .totalRevenue(totalRevenue)
                .totalTransactions(payments.size())
                .successRate((double) successfulCount / payments.size() * 100)
                .statusBreakdown(statusBreakdown)
                .trends(trends)
                .build();
    }

    public DashboardSummaryResponse getDashboardSummary(String token) {
        // Fetch patient count
        List<PatientResponse> patients = patientRestClient.get()
                .uri(patientProperties.getEndpoints().getBase())
                .retrieve()
                .body(new ParameterizedTypeReference<List<PatientResponse>>() {});
        long totalPatients = patients != null ? patients.size() : 0;

        // Fetch appointment count
        List<AppointmentResponse> appointments = appointmentRestClient.get()
                .uri(appointmentProperties.getEndpoints().getBase())
                .header("Authorization", token)
                .retrieve()
                .body(new ParameterizedTypeReference<List<AppointmentResponse>>() {});
        long totalAppointments = appointments != null ? appointments.size() : 0;

        // Count approved doctors
        long activeDoctors = userRepository.findByRoleAndApproved(Role.DOCTOR, true).size();

        // Total system users (Admins + Patients + Doctors)
        long totalSystemUsers = userRepository.count() + totalPatients;

        return DashboardSummaryResponse.builder()
                .totalPatients(totalPatients)
                .activeDoctors(activeDoctors)
                .totalAppointments(totalAppointments)
                .totalSystemUsers(totalSystemUsers)
                .build();
    }

    public List<SystemEventResponse> getRecentEvents() {
        return adminActionLogRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .map(log -> SystemEventResponse.builder()
                        .id(log.getId().toString())
                        .actionType(log.getActionType())
                        .requestedBy(log.getRequestedBy())
                        .description(formatDescription(log))
                        .timestamp(log.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    private String formatDescription(com.smarthealth.admin.model.AdminActionLog log) {
        if ("PATIENT_STATUS_UPDATED".equals(log.getActionType())) {
            return "Updated status for Patient #" + log.getTargetId().toString().substring(0, 8);
        }
        if ("PRESCRIPTION_SNAPSHOT_UPSERTED".equals(log.getActionType())) {
            return "Upserted prescription for Patient #" + log.getTargetId().toString().substring(0, 8);
        }
        return "Performed administrative action on " + log.getTargetType();
    }
}
