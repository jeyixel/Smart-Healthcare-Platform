package com.smarthealth.admin.repository;

import com.smarthealth.admin.model.PasswordResetOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface PasswordResetOtpRepository extends JpaRepository<PasswordResetOtp, Long> {

    List<PasswordResetOtp> findByEmailAndUsedFalse(String email);

    Optional<PasswordResetOtp> findTopByEmailAndUsedFalseAndExpiresAtAfterOrderByCreatedAtDesc(String email, OffsetDateTime now);

    @Modifying
    @Transactional
    void deleteByExpiresAtBefore(OffsetDateTime now);
}
