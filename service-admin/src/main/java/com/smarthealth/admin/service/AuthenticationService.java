package com.smarthealth.admin.service;

import com.smarthealth.admin.dto.AuthRequest;
import com.smarthealth.admin.dto.AuthResponse;
import com.smarthealth.admin.dto.RegisterRequest;
import com.smarthealth.admin.model.Role;
import com.smarthealth.admin.model.User;
import com.smarthealth.admin.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PatientAdminService patientAdminService;
    private final NotificationAdminService notificationAdminService;

    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail() == null ? "" : request.getEmail().trim().toLowerCase();
        if (normalizedEmail.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }
        if (request.getRole() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role is required");
        }
        if (request.getRole() != Role.PATIENT && request.getRole() != Role.DOCTOR) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only patient and doctor self-registration is allowed");
        }
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }

        boolean doctorPendingApproval = request.getRole() == Role.DOCTOR;
        var user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(normalizedEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .approved(!doctorPendingApproval)
                .build();
        userRepository.save(user);

        if (user.getRole() == Role.PATIENT) {
            try {
                patientAdminService.registerPatient(com.smarthealth.admin.dto.PatientUpsertRequest.builder()
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .email(user.getEmail())
                        .authUserId(user.getId().toString())
                        .phoneNumber("NONE") // Default placeholder as it's required by Patient service
                        .build());
                
                // Trigger welcome notification
                notificationAdminService.sendWelcomeEmail(user.getEmail(), user.getFirstName());
            } catch (Exception e) {
                // Log error but continue for now, or handle as needed
                System.err.println("Failed to sync records or send notification: " + e.getMessage());
            }
        }

        var jwtToken = jwtService.generateToken(user);
        return AuthResponse.builder()
                .token(jwtToken)
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        String normalizedEmail = request.getEmail() == null ? "" : request.getEmail().trim().toLowerCase();
        var existingUser = userRepository.findByEmailIgnoreCase(normalizedEmail).orElse(null);
        if (existingUser != null && existingUser.getRole() == Role.DOCTOR && !Boolean.TRUE.equals(existingUser.getApproved())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Your doctor account is pending admin approval. Please try again later.");
        }
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            normalizedEmail,
                            request.getPassword()
                    )
            );
            var user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Bad credentials"));
            var jwtToken = jwtService.generateToken(user);
            return AuthResponse.builder()
                    .token(jwtToken)
                    .userId(user.getId())
                    .email(user.getEmail())
                    .role(user.getRole().name())
                    .build();
        } catch (AuthenticationException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Bad credentials", ex);
        }
    }
}
