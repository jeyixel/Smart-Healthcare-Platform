package com.smarthealth.doctor.repository;

import com.smarthealth.doctor.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DoctorRepository extends JpaRepository<Doctor, UUID> {

    Optional<Doctor> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);

    boolean existsByEmail(String email);

    boolean existsByLicenseNumber(String licenseNumber);

    List<Doctor> findByVerifiedTrueAndActiveTrue();

    List<Doctor> findByVerifiedTrueAndActiveTrueAndSpecialtyIgnoreCase(String specialty);

    List<Doctor> findByVerifiedTrueAndActiveTrueAndCategoryIgnoreCase(String category);

    List<Doctor> findByVerifiedTrueAndActiveTrueAndSpecialtyIgnoreCaseAndCategoryIgnoreCase(
            String specialty,
            String category
    );
}
