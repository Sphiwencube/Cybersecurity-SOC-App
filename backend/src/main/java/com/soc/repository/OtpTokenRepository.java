package com.soc.repository;

import com.soc.model.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {
    
    Optional<OtpToken> findByEmailAndOtpCode(String email, String otpCode);
    
    Optional<OtpToken> findTopByEmailOrderByCreatedAtDesc(String email);
    
    void deleteByEmail(String email);
}