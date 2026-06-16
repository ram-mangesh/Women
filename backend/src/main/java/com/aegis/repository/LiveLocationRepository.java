package com.aegis.repository;

import com.aegis.entity.LiveLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LiveLocationRepository extends JpaRepository<LiveLocation, UUID> {
    List<LiveLocation> findTop50ByUserIdOrderByRecordedAtDesc(UUID userId);
    Optional<LiveLocation> findFirstByUserIdOrderByRecordedAtDesc(UUID userId);
    void deleteByUserIdAndRecordedAtBefore(UUID userId, Instant before);
}
