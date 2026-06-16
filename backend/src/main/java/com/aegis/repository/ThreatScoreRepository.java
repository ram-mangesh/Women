package com.aegis.repository;

import com.aegis.entity.ThreatScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ThreatScoreRepository extends JpaRepository<ThreatScore, UUID> {
    List<ThreatScore> findTop20ByUserIdOrderByComputedAtDesc(UUID userId);
    Optional<ThreatScore> findFirstByUserIdOrderByComputedAtDesc(UUID userId);
    long countByComputedAtAfter(Instant after);
}
