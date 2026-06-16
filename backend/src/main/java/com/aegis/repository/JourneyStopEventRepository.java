package com.aegis.repository;

import com.aegis.entity.JourneyStopEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JourneyStopEventRepository extends JpaRepository<JourneyStopEvent, UUID> {
    
    List<JourneyStopEvent> findByJourneyIdOrderByStartedAtAsc(UUID journeyId);
}
