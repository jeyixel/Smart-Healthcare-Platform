package com.smarthealth.admin.service;

import com.smarthealth.admin.model.PasswordResetOtp;
import com.smarthealth.admin.model.User;
import com.smarthealth.admin.repository.PasswordResetOtpRepository;
import com.smarthealth.admin.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private static final int OTP_LENGTH = 6;
    private static final int MAX_ATTEMPTS = 5;

    private final UserRepository userRepository;
    private final PasswordResetOtpRepository passwordResetOtpRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    @Value("${app.mail.from:no-reply@smarthealth.local}")
    private String mailFrom;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Value("${app.security.otp.expiration-minutes:10}")
    private long otpExpirationMinutes;

    @Transactional
    public String requestOtp(String email) {
        String normalizedEmail = email == null ? "" : email.trim().toLowerCase();
        if (normalizedEmail.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }

        cleanupExpiredOtps();
        invalidateActiveOtps(normalizedEmail);

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail).orElse(null);
        if (user == null) {
            return "If the email exists, an OTP was sent";
        }

        String otp = generateOtp();
        PasswordResetOtp record = PasswordResetOtp.builder()
                .email(normalizedEmail)
                .otpCode(otp)
                .used(false)
                .attemptCount(0)
                .createdAt(OffsetDateTime.now())
                .expiresAt(OffsetDateTime.now().plusMinutes(otpExpirationMinutes))
                .build();

        passwordResetOtpRepository.save(record);
        sendOtpEmail(normalizedEmail, otp);

        return "If the email exists, an OTP was sent";
    }

    @Transactional
    public String resetPassword(String email, String otp, String newPassword) {
        String normalizedEmail = email == null ? "" : email.trim().toLowerCase();
        String otpValue = otp == null ? "" : otp.trim();

        if (normalizedEmail.isBlank() || otpValue.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email and OTP are required");
        }

        PasswordResetOtp activeOtp = passwordResetOtpRepository
                .findTopByEmailAndUsedFalseAndExpiresAtAfterOrderByCreatedAtDesc(normalizedEmail, OffsetDateTime.now())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired OTP"));

        if (!activeOtp.getOtpCode().equals(otpValue)) {
            activeOtp.setAttemptCount(activeOtp.getAttemptCount() + 1);
            if (activeOtp.getAttemptCount() >= MAX_ATTEMPTS) {
                activeOtp.setUsed(true);
            }
            passwordResetOtpRepository.save(activeOtp);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired OTP");
        }

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired OTP"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        activeOtp.setUsed(true);
        passwordResetOtpRepository.save(activeOtp);

        return "Password has been reset successfully";
    }

    private void cleanupExpiredOtps() {
        passwordResetOtpRepository.deleteByExpiresAtBefore(OffsetDateTime.now());
    }

    private void invalidateActiveOtps(String email) {
        List<PasswordResetOtp> activeOtps = passwordResetOtpRepository.findByEmailAndUsedFalse(email);
        if (activeOtps.isEmpty()) {
            return;
        }
        activeOtps.forEach(item -> item.setUsed(true));
        passwordResetOtpRepository.saveAll(activeOtps);
    }

    private void sendOtpEmail(String recipient, String otp) {
        if (mailUsername == null || mailUsername.isBlank() || mailPassword == null || mailPassword.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "SMTP is not configured. Set MAIL_USERNAME and MAIL_PASSWORD in environment."
            );
        }

        String normalizedUsername = mailUsername.trim().toLowerCase();
        String normalizedPassword = mailPassword.trim().toLowerCase();
        if (normalizedUsername.contains("your-email") || normalizedPassword.contains("your-app-password")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "SMTP uses placeholder values. Set real MAIL_USERNAME and MAIL_PASSWORD."
            );
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailFrom);
            message.setTo(recipient);
            message.setSubject("Smart Healthcare - Password Reset OTP");
            message.setText("Your OTP for password reset is: " + otp + "\n\nIt expires in " + otpExpirationMinutes + " minutes.");
            mailSender.send(message);
        } catch (MailAuthenticationException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "SMTP authentication failed. Verify MAIL_USERNAME and MAIL_PASSWORD (use Gmail App Password).",
                    ex
            );
        } catch (MailSendException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "SMTP server rejected the message. Verify MAIL_HOST, MAIL_PORT, MAIL_FROM and recipient email.",
                    ex
            );
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to send OTP email", ex);
        }
    }

    private String generateOtp() {
        SecureRandom secureRandom = new SecureRandom();
        int lowerBound = (int) Math.pow(10, OTP_LENGTH - 1);
        int upperBound = (int) Math.pow(10, OTP_LENGTH) - 1;
        int otp = secureRandom.nextInt(upperBound - lowerBound + 1) + lowerBound;
        return String.valueOf(otp);
    }
}
