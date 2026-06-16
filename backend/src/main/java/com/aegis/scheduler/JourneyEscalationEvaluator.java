package com.aegis.scheduler;

import com.aegis.entity.JourneyEscalationRecord;
import com.aegis.kafka.dto.JourneyEvent;
import com.aegis.kafka.producer.JourneyEventProducer;
import com.aegis.repository.JourneyEscalationRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Escalation auto-escalation timer.
 *
 * Runs every 60 seconds and checks for PENDING escalation records that have not
 * been acknowledged within 5 minutes. For each such record the escalation level
 * is incremented (max 4). Once level 4 is reached no further increments occur.
 *
 * If a record is already ACKNOWLEDGED it is silently skipped — the guardian
 * response halts the escalation chain.
 *
 * Failure tolerance: all DB and Kafka operations are wrapped so that a single
 * record failure does not abort the entire batch.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JourneyEscalationEvaluator {

    private static final int MAX_ESCALATION_LEVEL = 4;
    /** An escalation must be older than this before it is eligible for a level increment. */
    private static final int ESCALATION_WINDOW_MINUTES = 5;

    private final JourneyEscalationRecordRepository escalationRepo;
    private final JourneyEventProducer eventProducer;

    @Scheduled(fixedDelay = 60_000, initialDelay = 30_000)
    @SchedulerLock(name = "journeyEscalationEvaluator", lockAtMostFor = "55s", lockAtLeastFor = "5s")
    @Transactional
    public void evaluateEscalations() {
        log.debug("Running JourneyEscalationEvaluator...");

        Instant cutoff = Instant.now().minus(ESCALATION_WINDOW_MINUTES, ChronoUnit.MINUTES);

        List<JourneyEscalationRecord> pending;
        try {
            pending = escalationRepo.findPendingOlderThan(cutoff);
        } catch (Exception e) {
            log.error("JourneyEscalationEvaluator: DB query failed, skipping run. Error: {}", e.getMessage());
            return;
        }

        if (pending.isEmpty()) {
            log.debug("JourneyEscalationEvaluator: no pending escalations to process.");
            return;
        }

        log.info("JourneyEscalationEvaluator: processing {} pending escalations older than {} minutes.",
                pending.size(), ESCALATION_WINDOW_MINUTES);

        for (JourneyEscalationRecord record : pending) {
            try {
                processRecord(record);
            } catch (Exception e) {
                // Isolate per-record failures so the rest of the batch still runs
                log.error("JourneyEscalationEvaluator: failed to process escalation record {}: {}",
                        record.getId(), e.getMessage());
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────────────

    private void processRecord(JourneyEscalationRecord record) {
        int currentLevel = record.getEscalationLevel() != null ? record.getEscalationLevel() : 1;

        if (currentLevel >= MAX_ESCALATION_LEVEL) {
            log.info("Escalation {} already at max level {}. No further escalation.", record.getId(), MAX_ESCALATION_LEVEL);
            return;
        }

        int newLevel = currentLevel + 1;
        record.setEscalationLevel(newLevel);
        escalationRepo.save(record);

        log.warn("Escalation {} for journey {} incremented to level {} (unacknowledged > {}min)",
                record.getId(), record.getJourney().getId(), newLevel, ESCALATION_WINDOW_MINUTES);

        // Publish a deterministic event so duplicate Kafka messages are idempotent
        UUID deterministicEventId = UUID.nameUUIDFromBytes(
                ("escalation-level-" + record.getId() + "-" + newLevel)
                        .getBytes(java.nio.charset.StandardCharsets.UTF_8));

        try {
            eventProducer.publishEvent(
                    deterministicEventId,
                    record.getJourney().getId(),
                    JourneyEvent.EventType.AUTO_ESCALATION,
                    Map.of(
                            "escalationId", record.getId(),
                            "escalationLevel", newLevel,
                            "triggerReason", record.getTriggerReason()
                    )
            );
        } catch (Exception e) {
            // Kafka down must not crash the scheduler
            log.error("JourneyEscalationEvaluator: Kafka publish failed for escalation {}: {}",
                    record.getId(), e.getMessage());
        }
    }
}
