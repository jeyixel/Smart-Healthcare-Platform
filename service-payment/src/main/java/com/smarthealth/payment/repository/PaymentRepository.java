package com.smarthealth.payment.repository;

import com.smarthealth.payment.entity.Payment;
import com.smarthealth.payment.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByOrderId(String orderId);
    List<Payment> findByPatientId(String patientId);
    List<Payment> findByAppointmentId(Long appointmentId);
    List<Payment> findByStatus(PaymentStatus status);
}