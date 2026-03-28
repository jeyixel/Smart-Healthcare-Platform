package com.smarthealth.appointment.repository;

import com.smarthealth.appointment.entity.Appointment;
import com.smarthealth.appointment.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    List<Appointment> findByPatientId(UUID patientId);

    List<Appointment> findByDoctorId(UUID doctorId);

    List<Appointment> findByStatus(AppointmentStatus status);

    boolean existsByDoctorIdAndAppointmentDateAndAppointmentTimeAndStatusIn(
            UUID doctorId,
            LocalDate appointmentDate,
            LocalTime appointmentTime,
            List<AppointmentStatus> statuses
    );

}
