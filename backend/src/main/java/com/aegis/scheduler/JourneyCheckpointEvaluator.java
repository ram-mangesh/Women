package com.aegis.scheduler;

import com.aegis.entity.JourneyCheckpoint;
import com.aegis.entity.SafeJourneySession;
import com.aegis.kafka.dto.JourneyEvent;
import com.aegis.kafka.producer.JourneyEventProducer;
import com.aegis.repository.JourneyCheckpointRepository;
import com.aegis.repository.SafeJourneyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.redis.core.RedisTemplate;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class JourneyCheckpointEvaluator {

    private final JourneyCheckpointRepository checkpointRepo;
    private final SafeJourneyRepository journeyRepo;
    private final JourneyEventProducer eventProducer;
    private final RedisTemplate<String, Object> redisTemplate;

    @Scheduled(fixedDelay = 30000, initialDelay = 10000)
    @SchedulerLock(name = "journeyCheckpointEvaluator", lockAtMostFor = "25s", lockAtLeastFor = "5s")
    @Transactional
    public void evaluateCheckpoints() {
        log.info("Running JourneyCheckpointEvaluator...");
        Instant now = Instant.now();
        
        List<JourneyCheckpoint> pendingCheckpoints = checkpointRepo
            .findByStatusAndScheduledAtBefore(JourneyCheckpoint.CheckpointStatus.PENDING, now);
            
        for (JourneyCheckpoint cp : pendingCheckpoints) {
            Instant expiryTime = cp.getScheduledAt().plusSeconds(cp.getResponseWindowSec());
            
            if (now.isAfter(expiryTime)) {
                cp.setStatus(JourneyCheckpoint.CheckpointStatus.MISSED);
                checkpointRepo.save(cp);
                
                SafeJourneySession session = cp.getJourney();
                session.setMissedCheckpoints(session.getMissedCheckpoints() + 1);
                journeyRepo.save(session);
                
                try {
                    redisTemplate.delete("journey:session:" + session.getId());
                } catch (Exception e) {
                    log.warn("Redis failure while evicting cached session: {}", e.getMessage());
                }
                
                log.info("Checkpoint {} for journey {} marked as MISSED", cp.getId(), session.getId());
                UUID deterministicEventId = UUID.nameUUIDFromBytes(String.format("checkpoint-%s-MISSED", cp.getId()).getBytes(java.nio.charset.StandardCharsets.UTF_8));
                eventProducer.publishEvent(deterministicEventId, session.getId(), JourneyEvent.EventType.CHECKPOINT_MISSED, java.util.Map.of(
                    "checkpointId", cp.getId(),
                    "missedCheckpointsCount", session.getMissedCheckpoints()
                ));
            }
        }
    }
}
