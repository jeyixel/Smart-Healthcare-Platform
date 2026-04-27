package com.smarthealth.patient.repository;

import com.smarthealth.patient.model.MedicationReminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MedicationReminderRepository extends JpaRepository<MedicationReminder, UUID> {
    List<MedicationReminder> findByPatientIdOrderByStartDateDesc(UUID patientId);
    List<MedicationReminder> findByPatientIdAndStatusOrderByStartDateDesc(UUID patientId, String status);
    boolean existsByPrescriptionId(UUID prescriptionId);
}
