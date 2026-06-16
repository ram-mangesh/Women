package com.aegis.repository;

import com.aegis.entity.JourneyCheckpoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface JourneyCheckpointRepository extends JpaRepository<JourneyCheckpoint, UUID> {
    
    List<JourneyCheckpoint> findByJourneyIdOrderByCheckpointMinuteAsc(UUID journeyId);
    
    List<JourneyCheckpoint> findByStatusAndScheduledAtBefore(JourneyCheckpoint.CheckpointStatus status, Instant time);
}
