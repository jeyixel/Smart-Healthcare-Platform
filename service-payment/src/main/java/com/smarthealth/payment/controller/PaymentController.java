package com.smarthealth.payment.controller;

import com.smarthealth.payment.dto.*;
import com.smarthealth.payment.util.PayHereHashUtil;
import com.smarthealth.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @Value("${payhere.merchant.id}")
    private String merchantId;

    @Value("${payhere.merchant.secret}")
    private String merchantSecret;

    // Initiate a payment — returns PayHere form data
    @PostMapping("/initiate")
    public ResponseEntity<PaymentInitiateResponse> initiatePayment(
            @Valid @RequestBody PaymentInitiateRequest request) {
        return ResponseEntity.ok(paymentService.initiatePayment(request));
    }

    // PayHere calls this URL after payment (webhook)
    @PostMapping("/notify")
    public ResponseEntity<String> handleNotification(
            @ModelAttribute PayhereNotifyRequest notify) {
        paymentService.handlePayhereNotification(notify);
        return ResponseEntity.ok("OK");
    }

    // Get payment by order ID
    @GetMapping("/hash")
    public ResponseEntity<PayHereHashResponse> generateHash(
            @RequestParam String orderId,
            @RequestParam BigDecimal amount
    ) {
        String currency = "LKR";
        String hash = PayHereHashUtil.generateHash(
                merchantId,
                orderId,
                amount,
                currency,
                merchantSecret
        );
        return ResponseEntity.ok(
                new PayHereHashResponse(
                        hash,
                        merchantId,
                        orderId,
                        String.format("%.2f", amount),
                        currency
                )
        );
    }

    // Get payment by order ID
    @GetMapping("/{orderId}")
    public ResponseEntity<PaymentResponse> getPayment(@PathVariable String orderId) {
        return ResponseEntity.ok(paymentService.getPaymentByOrderId(orderId));
    }

    // Get all payments for a patient
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<PaymentResponse>> getByPatient(@PathVariable String patientId) {
        return ResponseEntity.ok(paymentService.getPaymentsByPatient(patientId));
    }

    // Get payments for an appointment
    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<List<PaymentResponse>> getByAppointment(@PathVariable java.util.UUID appointmentId) {
        return ResponseEntity.ok(paymentService.getPaymentsByAppointment(appointmentId));
    }

    // Get all payments (admin)
    @GetMapping
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    // Update payment status for an appointment
    @PatchMapping("/appointments/{appointmentId}/status")
    public ResponseEntity<PaymentResponse> updateStatus(
            @PathVariable java.util.UUID appointmentId,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail,
            @RequestBody PaymentStatusUpdateRequest request) {
        return ResponseEntity.ok(paymentService.updateAppointmentPaymentStatus(appointmentId, userEmail, request));
    }
}