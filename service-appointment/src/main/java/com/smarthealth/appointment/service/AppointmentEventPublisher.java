package com.smarthealth.appointment.service;

import com.smarthealth.appointment.client.ServiceClient;
import com.smarthealth.appointment.dto.AppointmentEventDto;
import com.smarthealth.appointment.dto.external.DoctorResponse;
import com.smarthealth.appointment.dto.external.PatientResponse;
import com.smarthealth.appointment.entity.Appointment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
@Slf4j
public class AppointmentEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ServiceClient serviceClient;

    public void publishAppointmentEvent(String topic, String eventType, Appointment appointment) {
        try {
            PatientResponse patient = serviceClient.getPatient(appointment.getPatientId());
            DoctorResponse doctor = serviceClient.getDoctor(appointment.getDoctorId());

            AppointmentEventDto event = AppointmentEventDto.builder()
                    .eventType(eventType)
                    .appointmentId(appointment.getId().toString())
                    .patientId(appointment.getPatientId().toString())
                    .doctorId(appointment.getDoctorId().toString())
                    .patientEmail(patient != null ? patient.email() : "")
                    .patientPhone(patient != null ? patient.phoneNumber() : "")
                    .patientName(patient != null ? patient.firstName() + " " + patient.lastName() : "")
                    .doctorName(doctor != null ? doctor.fullName() : "")
                    .doctorEmail(doctor != null ? doctor.email() : "")
                    .doctorPhone(doctor != null ? doctor.phone() : "")
                    .appointmentDate(appointment.getAppointmentDate().toString())
                    .appointmentTime(appointment.getAppointmentTime().toString())
                    .consultationType(appointment.getConsultationType() != null ? appointment.getConsultationType().name() : "")
                    .status(appointment.getStatus().name())
                    .timestamp(Instant.now().toString())
                    .build();

            kafkaTemplate.send(topic, event.getAppointmentId(), event);
            log.info("Published {} event to topic {}: {}", eventType, topic, event.getAppointmentId());
        } catch (Exception e) {
            log.error("Failed to publish {} event for appointment {}: {}", eventType, appointment.getId(), e.getMessage());
        }
    }
}
