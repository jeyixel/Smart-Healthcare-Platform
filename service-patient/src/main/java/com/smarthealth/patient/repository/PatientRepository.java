package com.smarthealth.patient.repository;

import com.smarthealth.patient.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PatientRepository extends JpaRepository<Patient, UUID> {
    boolean existsByEmailAndIdNot(String email, UUID id);

    boolean existsByEmail(String email);

    boolean existsByAuthUserIdAndIdNot(String authUserId, UUID id);

    boolean existsByAuthUserId(String authUserId);
}
