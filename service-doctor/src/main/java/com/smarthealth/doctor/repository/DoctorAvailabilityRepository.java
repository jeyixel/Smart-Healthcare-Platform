package com.smarthealth.doctor.repository;

import com.smarthealth.doctor.entity.DoctorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DoctorAvailabilityRepository extends JpaRepository<DoctorAvailability, UUID> {
    List<DoctorAvailability> findByDoctorId(UUID doctorId);
    void deleteByDoctorId(UUID doctorId);
}
