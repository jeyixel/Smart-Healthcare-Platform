package com.smarthealth.telemedicine.service;

import com.smarthealth.telemedicine.model.TelemedicineSession;
import com.smarthealth.telemedicine.repository.TelemedicineSessionRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class TelemedicineService {

    private final TelemedicineSessionRepository repository;

    // The public Jitsi Meet server URL
    private static final String JITSI_BASE_URL = "https://meet.jit.si/";

    // Constructor injection of the repository
    public TelemedicineService(TelemedicineSessionRepository repository) {
        this.repository = repository;
    }

    public TelemedicineSession createSession(String appointmentId, String patientId, String doctorId) {
        // Generate a secure, unique room name (e.g., smarthealth-550e8400-e29b-41d4-a716-446655440000)
        String roomName = "smarthealth-" + UUID.randomUUID().toString();
        String meetingUrl = JITSI_BASE_URL + roomName;

        TelemedicineSession session = new TelemedicineSession();
        session.setAppointmentId(appointmentId);
        session.setPatientId(patientId);
        session.setDoctorId(doctorId);
        session.setRoomName(roomName);
        session.setMeetingUrl(meetingUrl);
        // Note: 'status' and 'createdAt' are automatically handled by the @PrePersist in your Model

        return repository.save(session);
    }

    public Optional<TelemedicineSession> getSessionByAppointment(String appointmentId) {
        return repository.findByAppointmentId(appointmentId);
    }

    // Fetches a specific session by its primary key (UUID)
    public Optional<TelemedicineSession> getSessionById(UUID sessionId) {
        return repository.findById(sessionId);
    }

    // Saves any updates made to an existing session back to Supabase
    public TelemedicineSession updateSession(TelemedicineSession session) {
        return repository.save(session);
    }
}