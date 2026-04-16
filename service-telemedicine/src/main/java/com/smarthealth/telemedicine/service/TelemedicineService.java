package com.smarthealth.telemedicine.service;

import com.smarthealth.telemedicine.model.TelemedicineSession;
import com.smarthealth.telemedicine.repository.TelemedicineSessionRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class TelemedicineService {

    private final TelemedicineSessionRepository repository;

    @Value("${jaas.app-id}")
    private String jaasAppId;

    @Value("${jaas.api-key-id}")
    private String jaasApiKeyId;

    @Value("${jaas.private-key}")
    private String jaasPrivateKey;

    public TelemedicineService(TelemedicineSessionRepository repository) {
        this.repository = repository;
    }

    public TelemedicineSession createSession(String appointmentId, String patientId, String doctorId) {
        // Generate a secure, unique room name
        String roomName = "smarthealth-" + UUID.randomUUID().toString();
        // Construct the new JaaS meeting URL
        String meetingUrl = "https://8x8.vc/" + jaasAppId + "/" + roomName;

        TelemedicineSession session = new TelemedicineSession();
        session.setAppointmentId(appointmentId);
        session.setPatientId(patientId);
        session.setDoctorId(doctorId);
        session.setRoomName(roomName);
        session.setMeetingUrl(meetingUrl);

        return repository.save(session);
    }

    public Optional<TelemedicineSession> getSessionByAppointment(String appointmentId) {
        return repository.findByAppointmentId(appointmentId);
    }

    public Optional<TelemedicineSession> getSessionById(UUID sessionId) {
        return repository.findById(sessionId);
    }

    public TelemedicineSession updateSession(TelemedicineSession session) {
        return repository.save(session);
    }

    // TODO: Make sure to check if appointmentID exists in the Appointment DB Service before creating a session.
    //  I think in the appointment service, when an appointment is created it calls the telemedicine service to create a session, just check whether its still there
    public String generateJitsiToken(String room, String userName, String userEmail) throws Exception {
        PrivateKey privateKey = parsePrivateKey(jaasPrivateKey);

        Map<String, Object> userMap = new HashMap<>();
        userMap.put("name", userName != null ? userName : "Guest");
        userMap.put("email", userEmail != null ? userEmail : "");
        
        Map<String, Object> contextMap = new HashMap<>();
        contextMap.put("user", userMap);

        return Jwts.builder()
                .setHeaderParam("kid", jaasApiKeyId)
                .setHeaderParam("typ", "JWT")
                .setIssuer(jaasAppId)
                .setSubject(jaasAppId)
                .setAudience("jitsi")
                .claim("room", room != null && !room.isBlank() ? room : "*")
                .claim("context", contextMap)
                .setIssuedAt(new Date())
                .setNotBefore(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 7200 * 1000)) // valid for 2 hours
                .signWith(privateKey, SignatureAlgorithm.RS256)
                .compact();
    }

    private PrivateKey parsePrivateKey(String privateKeyPEM) throws Exception {
        if (privateKeyPEM == null || privateKeyPEM.isBlank()) {
            throw new IllegalArgumentException("Private key is missing or empty.");
        }
        String privKeyPEM = privateKeyPEM
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s", "");
        byte[] encoded = Base64.getDecoder().decode(privKeyPEM);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(encoded);
        return keyFactory.generatePrivate(keySpec);
    }
}