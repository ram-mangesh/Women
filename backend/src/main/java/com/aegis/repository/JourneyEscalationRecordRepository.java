package com.aegis.repository;

import com.aegis.entity.JourneyEscalationRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface JourneyEscalationRecordRepository extends JpaRepository<JourneyEscalationRecord, UUID> {

    /**
     * Returns all PENDING escalation records created before the given cutoff.
     * Used by the escalation evaluator to escalate un-acknowledged records.
     */
    @Query("SELECT r FROM JourneyEscalationRecord r WHERE r.escalationStatus = 'PENDING' AND r.createdAt < :cutoff")
    List<JourneyEscalationRecord> findPendingOlderThan(@Param("cutoff") Instant cutoff);

    /**
     * Returns all escalation records for a given journey (latest first).
     */
    List<JourneyEscalationRecord> findByJourneyIdOrderByCreatedAtDesc(UUID journeyId);
}

