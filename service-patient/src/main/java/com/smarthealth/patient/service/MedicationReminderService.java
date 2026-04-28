package com.smarthealth.patient.service;

import com.smarthealth.patient.client.PrescriptionClient;
import com.smarthealth.patient.dto.PrescriptionItemResponse;
import com.smarthealth.patient.dto.PrescriptionResponse;
import com.smarthealth.patient.model.MedicationReminder;
import com.smarthealth.patient.repository.MedicationReminderRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MedicationReminderService {

    private static final Logger LOGGER = LoggerFactory.getLogger(MedicationReminderService.class);
    private final MedicationReminderRepository reminderRepository;
    private final PrescriptionClient prescriptionClient;

    @Transactional
    public void generateRemindersFromPrescription(UUID prescriptionId) {
        if (reminderRepository.existsByPrescriptionId(prescriptionId)) {
            LOGGER.info("Reminders already exist for prescription {}", prescriptionId);
            return;
        }

        PrescriptionResponse prescription = prescriptionClient.getPrescriptionById(prescriptionId);
        
        if (prescription == null || prescription.getItems() == null || prescription.getItems().isEmpty()) {
            LOGGER.warn("Prescription {} has no items or could not be fetched", prescriptionId);
            return;
        }

        Instant startDate = prescription.getIssuedAt() != null ? prescription.getIssuedAt() : Instant.now();

        List<MedicationReminder> reminders = prescription.getItems().stream().map(item -> {
            Instant endDate = calculateEndDate(startDate, item.getDuration());
            
            return MedicationReminder.builder()
                    .patientId(prescription.getPatientId())
                    .prescriptionId(prescription.getId())
                    .medicineName(item.getMedicineName())
                    .dosage(item.getDosage())
                    .frequency(item.getFrequency())
                    .duration(item.getDuration())
                    .instructions(item.getInstructions())
                    .startDate(startDate)
                    .endDate(endDate)
                    .status("ACTIVE")
                    .build();
        }).toList();

        reminderRepository.saveAll(reminders);
        LOGGER.info("Generated {} medication reminders for patient {} from prescription {}", 
                reminders.size(), prescription.getPatientId(), prescriptionId);
    }

    public List<MedicationReminder> getPatientReminders(UUID patientId) {
        return reminderRepository.findByPatientIdOrderByStartDateDesc(patientId);
    }

    public List<MedicationReminder> getActivePatientReminders(UUID patientId) {
        return reminderRepository.findByPatientIdAndStatusOrderByStartDateDesc(patientId, "ACTIVE");
    }
    
    @Transactional
    public MedicationReminder completeReminder(UUID reminderId) {
        MedicationReminder reminder = reminderRepository.findById(reminderId)
                .orElseThrow(() -> new RuntimeException("Reminder not found"));
        reminder.setStatus("COMPLETED");
        return reminderRepository.save(reminder);
    }

    private Instant calculateEndDate(Instant startDate, String durationStr) {
        if (durationStr == null || durationStr.isEmpty()) return null;
        
        try {
            // Very simple parser for "X days" or "X weeks"
            String[] parts = durationStr.toLowerCase().split(" ");
            if (parts.length >= 2) {
                int amount = Integer.parseInt(parts[0].trim());
                if (parts[1].contains("day")) {
                    return startDate.plus(amount, ChronoUnit.DAYS);
                } else if (parts[1].contains("week")) {
                    return startDate.plus(amount * 7L, ChronoUnit.DAYS);
                } else if (parts[1].contains("month")) {
                    return startDate.plus(amount * 30L, ChronoUnit.DAYS);
                }
            }
        } catch (Exception e) {
            LOGGER.warn("Could not parse duration '{}'", durationStr);
        }
        return startDate.plus(7, ChronoUnit.DAYS); // default fallback
    }
}
