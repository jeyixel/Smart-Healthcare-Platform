package com.smarthealth.payment.service;

import com.smarthealth.payment.config.PayHereConfig;
import com.smarthealth.payment.dto.*;
import com.smarthealth.payment.entity.Payment;
import com.smarthealth.payment.enums.PaymentStatus;
import com.smarthealth.payment.kafka.PaymentEventProducer;
import com.smarthealth.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PayHereConfig payHereConfig;
    private final PaymentEventProducer eventProducer;

    // Step 1: Initiate payment — create order and return PayHere form data
    public PaymentInitiateResponse initiatePayment(PaymentInitiateRequest request) {
        String orderId = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // Save payment record with PENDING status
        Payment payment = Payment.builder()
                .orderId(orderId)
                .appointmentId(request.getAppointmentId())
                .patientId(request.getPatientId())
                .patientEmail(request.getPatientEmail())
                .patientPhone(request.getPatientPhone())
                .patientFirstName(request.getPatientFirstName())
                .patientLastName(request.getPatientLastName())
                .doctorName(request.getDoctorName())
                .appointmentDate(request.getAppointmentDate())
                .amount(request.getAmount())
                .currency("LKR")
                .itemDescription(request.getItemDescription())
                .paymentReference(request.getPaymentReference())
                .status(PaymentStatus.PENDING)
                .build();

        paymentRepository.save(payment);

        // Generate PayHere hash
        String hash = generateHash(
                payHereConfig.getMerchantId(),
                orderId,
                request.getAmount().toString(),
                "LKR"
        );

        return PaymentInitiateResponse.builder()
                .orderId(orderId)
                .merchantId(payHereConfig.getMerchantId())
                .payhereUrl(payHereConfig.getBaseUrl())
                .amount(request.getAmount())
                .currency("LKR")
                .hash(hash)
                .itemDescription(request.getItemDescription())
                .firstName(request.getPatientFirstName())
                .lastName(request.getPatientLastName())
                .email(request.getPatientEmail())
                .phone(request.getPatientPhone())
                .notifyUrl("http://localhost:8084/api/payments/notify")
                .returnUrl("http://localhost:3000/payment/success")
                .cancelUrl("http://localhost:3000/payment/cancel")
                .build();
    }

    // Step 2: Handle PayHere notification (webhook)
    public void handlePayhereNotification(PayhereNotifyRequest notify) {
        Payment payment = paymentRepository.findByOrderId(notify.getOrder_id())
                .orElseThrow(() -> new RuntimeException("Payment not found: " + notify.getOrder_id()));

        // Verify the notification signature
        if (!verifyNotification(notify)) {
            log.error("Invalid PayHere notification signature for order: {}", notify.getOrder_id());
            return;
        }

        if (payment.getStatus() == PaymentStatus.SUCCESS || payment.getStatus() == PaymentStatus.FAILED || payment.getStatus() == PaymentStatus.CANCELLED) {
            log.info("Payment webhook ignored, duplicate or already processed for order: {}", notify.getOrder_id());
            return;
        }

        // PayHere status codes: 2=Success, 0=Pending, -1=Cancelled, -2=Failed, -3=Chargedback
        String statusCode = notify.getStatus_code();

        PaymentEventDto event = PaymentEventDto.builder()
                .orderId(payment.getOrderId())
                .appointmentId(payment.getAppointmentId())
                .patientId(payment.getPatientId())
                .patientEmail(payment.getPatientEmail())
                .patientPhone(payment.getPatientPhone())
                .patientFirstName(payment.getPatientFirstName())
                .patientLastName(payment.getPatientLastName())
                .patientName(payment.getPatientFirstName() + " " + payment.getPatientLastName())
                .doctorName(payment.getDoctorName())
                .appointmentDate(payment.getAppointmentDate())
                .transactionId(payment.getOrderId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .itemDescription(payment.getItemDescription())
                .build();

        switch (statusCode) {
            case "2" -> {
                payment.setStatus(PaymentStatus.SUCCESS);
                payment.setPayherePaymentId(notify.getPayment_id());
                payment.setPayhereStatusCode(statusCode);
                event.setStatus("SUCCESS");
                eventProducer.sendPaymentSuccess(event);
                
                eventProducer.sendPaymentCompleted(
                        new com.smarthealth.payment.dto.PaymentCompletedEventDto(
                                payment.getAppointmentId().toString(),
                                payment.getPatientId(),
                                payment.getAmount(),
                                "SUCCESS",
                                payment.getPaymentReference()
                        )
                );
                log.info("Payment successful for order: {}", notify.getOrder_id());
            }
            case "-1" -> {
                payment.setStatus(PaymentStatus.CANCELLED);
                payment.setPayhereStatusCode(statusCode);
                event.setStatus("CANCELLED");
                eventProducer.sendPaymentFailed(event);
                
                eventProducer.sendPaymentCompleted(
                        new com.smarthealth.payment.dto.PaymentCompletedEventDto(
                                payment.getAppointmentId().toString(),
                                payment.getPatientId(),
                                payment.getAmount(),
                                "FAILED",
                                payment.getPaymentReference()
                        )
                );
                log.info("Payment cancelled for order: {}", notify.getOrder_id());
            }
            case "-2", "-3" -> {
                payment.setStatus(PaymentStatus.FAILED);
                payment.setPayhereStatusCode(statusCode);
                payment.setFailureReason(notify.getStatus_message());
                event.setStatus("FAILED");
                eventProducer.sendPaymentFailed(event);
                
                eventProducer.sendPaymentCompleted(
                        new com.smarthealth.payment.dto.PaymentCompletedEventDto(
                                payment.getAppointmentId().toString(),
                                payment.getPatientId(),
                                payment.getAmount(),
                                "FAILED",
                                payment.getPaymentReference()
                        )
                );
                log.info("Payment failed for order: {}", notify.getOrder_id());
            }
            default -> log.warn("Unknown PayHere status code: {}", statusCode);
        }

        paymentRepository.save(payment);
    }

    public PaymentResponse getPaymentByOrderId(String orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found: " + orderId));
        return mapToResponse(payment);
    }

    public List<PaymentResponse> getPaymentsByPatient(String patientId) {
        return paymentRepository.findByPatientId(patientId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<PaymentResponse> getPaymentsByAppointment(java.util.UUID appointmentId) {
        return paymentRepository.findByAppointmentId(appointmentId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll()
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // Generate MD5 hash for PayHere
    private String generateHash(String merchantId, String orderId, String amount, String currency) {
        try {
            String secretHash = md5(payHereConfig.getMerchantSecret()).toUpperCase();
            String hash = md5(merchantId + orderId + amount + currency + secretHash).toUpperCase();
            return hash;
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PayHere hash", e);
        }
    }

    // Verify PayHere notification
    private boolean verifyNotification(PayhereNotifyRequest notify) {
        try {
            String secretHash = md5(payHereConfig.getMerchantSecret()).toUpperCase();
            String localMd5 = md5(
                    notify.getMerchant_id()
                            + notify.getOrder_id()
                            + notify.getPayhere_amount()
                            + notify.getPayhere_currency()
                            + notify.getStatus_code()
                            + secretHash
            ).toUpperCase();
            return localMd5.equals(notify.getMd5sig());
        } catch (Exception e) {
            return false;
        }
    }

    private String md5(String input) throws NoSuchAlgorithmException {
        MessageDigest md = MessageDigest.getInstance("MD5");
        byte[] hash = md.digest(input.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : hash) sb.append(String.format("%02x", b));
        return sb.toString();
    }

    private PaymentResponse mapToResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrderId())
                .appointmentId(payment.getAppointmentId())
                .patientId(payment.getPatientId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .status(payment.getStatus())
                .payherePaymentId(payment.getPayherePaymentId())
                .itemDescription(payment.getItemDescription())
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .build();
    }
}