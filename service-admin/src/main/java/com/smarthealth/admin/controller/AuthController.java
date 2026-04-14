package com.smarthealth.admin.controller;

import com.smarthealth.admin.dto.AuthRequest;
import com.smarthealth.admin.dto.AuthResponse;
import com.smarthealth.admin.dto.RegisterRequest;
import com.smarthealth.admin.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authenticationService.register(request));
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
}
