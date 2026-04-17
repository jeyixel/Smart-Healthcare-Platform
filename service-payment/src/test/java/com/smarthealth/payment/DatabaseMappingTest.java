package com.smarthealth.payment;

import com.smarthealth.payment.entity.Payment;
import com.smarthealth.payment.enums.PaymentStatus;
import com.smarthealth.payment.repository.PaymentRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
public class DatabaseMappingTest {

    @Autowired
    private PaymentRepository paymentRepository;

    @Test
    void testSaveAndFindPayment() {
        Payment payment = Payment.builder()
                .orderId("TEST-" + UUID.randomUUID())
                .appointmentId(UUID.randomUUID())
                .patientId("PAT-123")
                .patientEmail("test@example.com")
                .patientPhone("1234567890")
                .patientFirstName("John")
                .patientLastName("Doe")
                .doctorName("Dr. Smith")
                .appointmentDate("2026-05-20")
                .amount(new BigDecimal("1500.00"))
                .currency("LKR")
                .itemDescription("Test Payment")
                .status(PaymentStatus.PENDING)
                .build();

        Payment saved = paymentRepository.save(payment);
        assertNotNull(saved.getId());
        
        Payment found = paymentRepository.findById(saved.getId()).orElse(null);
        assertNotNull(found);
    }
}
