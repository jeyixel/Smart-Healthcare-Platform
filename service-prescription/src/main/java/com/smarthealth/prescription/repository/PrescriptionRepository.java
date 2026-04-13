package com.smarthealth.prescription.repository;

import com.smarthealth.prescription.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PrescriptionRepository extends JpaRepository<Prescription, UUID> {

    Optional<Prescription> findByAppointmentId(UUID appointmentId);

    boolean existsByAppointmentId(UUID appointmentId);

    List<Prescription> findByPatientIdOrderByCreatedAtDesc(UUID patientId);

    List<Prescription> findByDoctorIdOrderByCreatedAtDesc(UUID doctorId);
}

