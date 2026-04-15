package com.smarthealth.admin.controller;

import com.smarthealth.admin.dto.AuthRequest;
import com.smarthealth.admin.dto.AuthResponse;
import com.smarthealth.admin.dto.ForgotPasswordOtpRequest;
import com.smarthealth.admin.dto.ForgotPasswordResetRequest;
import com.smarthealth.admin.dto.RegisterRequest;
import com.smarthealth.admin.model.User;
import com.smarthealth.admin.service.AuthenticationService;
import com.smarthealth.admin.service.PasswordResetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationService authenticationService;
    private final PasswordResetService passwordResetService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authenticationService.register(request));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Unauthorized"));
        }

        return ResponseEntity.ok(Map.of(
                "email", user.getEmail(),
                "role", user.getRole() == null ? "" : user.getRole().name(),
                "approved", Boolean.TRUE.equals(user.getApproved())
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            return ResponseEntity.ok(authenticationService.login(request));
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode())
                    .body(Map.of(
                            "timestamp", OffsetDateTime.now().toString(),
                            "status", ex.getStatusCode().value(),
                            "error", HttpStatus.valueOf(ex.getStatusCode().value()).getReasonPhrase(),
                            "message", ex.getReason() != null ? ex.getReason() : "Unauthorized",
                            "path", "/api/v1/auth/login"
                    ));
        }
    }

    @PostMapping("/forgot-password/request-otp")
    public ResponseEntity<?> requestForgotPasswordOtp(@Valid @RequestBody ForgotPasswordOtpRequest request) {
        try {
            String message = passwordResetService.requestOtp(request.getEmail());
            return ResponseEntity.ok(Map.of("message", message));
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode())
                    .body(Map.of(
                            "timestamp", OffsetDateTime.now().toString(),
                            "status", ex.getStatusCode().value(),
                            "error", HttpStatus.valueOf(ex.getStatusCode().value()).getReasonPhrase(),
                            "message", ex.getReason() != null ? ex.getReason() : "Request failed",
                            "path", "/api/v1/auth/forgot-password/request-otp"
                    ));
        }
    }

    @PostMapping("/forgot-password/reset")
    public ResponseEntity<?> resetForgottenPassword(@Valid @RequestBody ForgotPasswordResetRequest request) {
        try {
            String message = passwordResetService.resetPassword(
                    request.getEmail(),
                    request.getOtp(),
                    request.getNewPassword()
            );
            return ResponseEntity.ok(Map.of("message", message));
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode())
                    .body(Map.of(
                            "timestamp", OffsetDateTime.now().toString(),
                            "status", ex.getStatusCode().value(),
                            "error", HttpStatus.valueOf(ex.getStatusCode().value()).getReasonPhrase(),
                            "message", ex.getReason() != null ? ex.getReason() : "Request failed",
                            "path", "/api/v1/auth/forgot-password/reset"
                    ));
        }
    }
}
