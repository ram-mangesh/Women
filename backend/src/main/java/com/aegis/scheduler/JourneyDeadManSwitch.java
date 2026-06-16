package com.aegis.scheduler;

import com.aegis.entity.JourneyEscalationRecord;
import com.aegis.entity.SafeJourneySession;
import com.aegis.kafka.dto.JourneyEvent;
import com.aegis.kafka.producer.JourneyEventProducer;
import com.aegis.repository.JourneyEscalationRecordRepository;
import com.aegis.repository.SafeJourneyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.redis.core.RedisTemplate;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class JourneyDeadManSwitch {

    private final SafeJourneyRepository journeyRepo;
    private final JourneyEscalationRecordRepository escalationRepo;
    private final JourneyEventProducer eventProducer;
    private final RedisTemplate<String, Object> redisTemplate;

    @Scheduled(fixedDelay = 60000, initialDelay = 15000)
    @SchedulerLock(name = "journeyDeadManSwitch", lockAtMostFor = "50s", lockAtLeastFor = "5s")
    @Transactional
    public void evaluateDeadManSwitch() {
        log.info("Running JourneyDeadManSwitch...");
        UUID lastId = new UUID(0L, 0L);
        int size = 500;
        
        List<SafeJourneySession.JourneyStatus> terminalStatuses = Arrays.asList(
            SafeJourneySession.JourneyStatus.COMPLETED,
            SafeJourneySession.JourneyStatus.CANCELLED,
            SafeJourneySession.JourneyStatus.SOS,
            SafeJourneySession.JourneyStatus.AUTO_ESCALATION_PENDING
        );
        
        Instant now = Instant.now();
        
        while (true) {
            Pageable pageable = PageRequest.of(0, size);
            List<SafeJourneySession> sessions = journeyRepo
                .findByExpectedArrivalTimeBeforeAndStatusNotInAndIdGreaterThanOrderByIdAsc(now, terminalStatuses, lastId, pageable);
                
            if (sessions.isEmpty()) {
                break;
            }
            
            for (SafeJourneySession session : sessions) {
                lastId = session.getId();
                log.warn("Dead man switch triggered for journey {}", session.getId());
                
                session.setStatus(SafeJourneySession.JourneyStatus.AUTO_ESCALATION_PENDING);
                journeyRepo.save(session);
                
                try {
                    redisTemplate.delete("journey:session:" + session.getId());
                } catch (Exception e) {
                    log.warn("Redis failure while evicting cached session: {}", e.getMessage());
                }
                
                JourneyEscalationRecord record = JourneyEscalationRecord.builder()
                        .journey(session)
                        .triggerReason("DEAD_MAN_SWITCH_ARRIVAL_TIME_EXCEEDED")
                        .escalationStatus("PENDING")
                        .escalationLevel(1)
                        .lastLatitude(session.getLastKnownLat())
                        .lastLongitude(session.getLastKnownLng())
                        .lastHeartbeatTime(session.getLastHeartbeatTime())
                        .build();
                escalationRepo.save(record);
                
                eventProducer.publishEvent(record.getId(), session.getId(), JourneyEvent.EventType.AUTO_ESCALATION, java.util.Map.of(
                    "escalationId", record.getId(),
                    "triggerReason", record.getTriggerReason()
                ));
            }
            
            if (sessions.size() < size) {
                break;
            }
        }
    }
}
