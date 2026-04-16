package com.smarthealth.payment.entity;

import com.smarthealth.payment.enums.PaymentMethod;
import com.smarthealth.payment.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "payments", schema = "payment_service")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String orderId;           // unique order ID sent to PayHere

    @Column(nullable = false)
    private UUID appointmentId;

    @Column(nullable = false)
    private String patientId;

    @Column(nullable = false)
    private String patientEmail;

    @Column(nullable = false)
    private String patientPhone;

    @Column(nullable = false)
    private String patientFirstName;

    @Column(nullable = false)
    private String patientLastName;

    @Column(nullable = false)
    private String doctorName;

    @Column(nullable = false)
    private String appointmentDate;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private String currency = "LKR";

    @Column(nullable = false)
    private String itemDescription;   // e.g. "Consultation with Dr. Perera"

    @Column(nullable = false)
    private String paymentReference;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    private String payherePaymentId;  // PayHere's payment ID after success
    private String payhereStatusCode; // PayHere status code from notify
    private String failureReason;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}