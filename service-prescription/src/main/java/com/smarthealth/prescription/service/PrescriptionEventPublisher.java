package com.smarthealth.prescription.service;

import com.smarthealth.prescription.client.ServiceClient;
import com.smarthealth.prescription.dto.PrescriptionEventDto;
import com.smarthealth.prescription.dto.external.DoctorResponse;
import com.smarthealth.prescription.dto.external.PatientResponse;
import com.smarthealth.prescription.entity.Prescription;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
@Slf4j
public class PrescriptionEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ServiceClient serviceClient;

    public void publishPrescriptionEvent(String topic, String eventType, Prescription prescription) {
        try {
            PatientResponse patient = serviceClient.getPatient(prescription.getPatientId());
            DoctorResponse doctor = serviceClient.getDoctor(prescription.getDoctorId());

            String medSummary = prescription.getItems().size() + " medication(s) prescribed.";

            PrescriptionEventDto event = PrescriptionEventDto.builder()
                    .eventType(eventType)
                    .prescriptionId(prescription.getId().toString())
                    .appointmentId(prescription.getAppointmentId().toString())
                    .patientId(prescription.getPatientId().toString())
                    .doctorId(prescription.getDoctorId().toString())
                    .patientEmail(patient != null ? patient.email() : "")
                    .patientPhone(patient != null ? patient.phoneNumber() : "")
                    .patientName(patient != null ? patient.firstName() + " " + patient.lastName() : "")
                    .doctorName(doctor != null ? doctor.fullName() : "")
                    .doctorEmail(doctor != null ? doctor.email() : "")
                    .doctorPhone(doctor != null ? doctor.phone() : "")
                    .prescriptionDate(prescription.getCreatedAt() != null ? prescription.getCreatedAt().toString() : Instant.now().toString())
                    .medicationSummary(medSummary)
                    .timestamp(Instant.now().toString())
                    .build();

            kafkaTemplate.send(topic, event.getPrescriptionId(), event);
            log.info("Published {} event to topic {}: {}", eventType, topic, event.getPrescriptionId());
        } catch (Exception e) {
            log.error("Failed to publish {} event for prescription {}: {}", eventType, prescription.getId(), e.getMessage());
        }
    }
}
