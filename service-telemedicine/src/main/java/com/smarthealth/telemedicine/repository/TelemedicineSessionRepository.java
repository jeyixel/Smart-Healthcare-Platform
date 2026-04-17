package com.smarthealth.telemedicine.repository;

import com.smarthealth.telemedicine.model.TelemedicineSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TelemedicineSessionRepository extends JpaRepository<TelemedicineSession, UUID> {

    // Custom query to find a session by the mock appointment ID
    Optional<TelemedicineSession> findByAppointmentId(String appointmentId);

    // Custom query to find all sessions for a specific patient
    List<TelemedicineSession> findByPatientId(String patientId);

    // Custom query to find all sessions for a specific doctor
    List<TelemedicineSession> findByDoctorId(String doctorId);
}