package com.aegis.repository;

import com.aegis.entity.VoiceCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface VoiceCodeRepository extends JpaRepository<VoiceCode, Long> {
    Optional<VoiceCode> findByUserIdAndActiveTrue(UUID userId);
    void deleteByUserId(UUID userId);
}
