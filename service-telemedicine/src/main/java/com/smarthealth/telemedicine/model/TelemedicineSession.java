package com.smarthealth.telemedicine.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "telemedicine_sessions")
public class TelemedicineSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID sessionId;

    @Column(nullable = false)
    private String appointmentId; // Using String to easily accept mock data

    @Column(nullable = false)
    private String patientId;

    @Column(nullable = false)
    private String doctorId;

    @Column(nullable = false, unique = true)
    private String roomName;

    @Column(nullable = false)
    private String meetingUrl;

    @Column(nullable = false)
    private String status; // e.g., SCHEDULED, ACTIVE, COMPLETED

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "SCHEDULED";
        }
    }

    // Getters and Setters
    public UUID getSessionId() { return sessionId; }
    public void setSessionId(UUID sessionId) { this.sessionId = sessionId; }

    public String getAppointmentId() { return appointmentId; }
    public void setAppointmentId(String appointmentId) { this.appointmentId = appointmentId; }

    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public String getDoctorId() { return doctorId; }
    public void setDoctorId(String doctorId) { this.doctorId = doctorId; }

    public String getRoomName() { return roomName; }
    public void setRoomName(String roomName) { this.roomName = roomName; }

    public String getMeetingUrl() { return meetingUrl; }
    public void setMeetingUrl(String meetingUrl) { this.meetingUrl = meetingUrl; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}