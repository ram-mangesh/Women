package com.aegis.scheduler;

import com.aegis.entity.SafeJourneySession;
import com.aegis.kafka.dto.JourneyEvent;
import com.aegis.kafka.producer.JourneyEventProducer;
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

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class JourneyHeartbeatMonitor {

    private final SafeJourneyRepository journeyRepo;
    private final JourneyEventProducer eventProducer;

    @Scheduled(fixedDelay = 60000, initialDelay = 5000)
    @SchedulerLock(name = "journeyHeartbeatMonitor", lockAtMostFor = "50s", lockAtLeastFor = "5s")
    @Transactional
    public void monitorHeartbeats() {
        log.info("Running JourneyHeartbeatMonitor...");
        UUID lastId = new UUID(0L, 0L);
        int size = 500;
        
        List<SafeJourneySession.JourneyStatus> activeStatuses = Arrays.asList(
            SafeJourneySession.JourneyStatus.ACTIVE,
            SafeJourneySession.JourneyStatus.CONNECTION_LOST
        );
        
        while (true) {
            Pageable pageable = PageRequest.of(0, size);
            List<SafeJourneySession> sessions = journeyRepo.findByStatusInAndIdGreaterThanOrderByIdAsc(activeStatuses, lastId, pageable);
            
            if (sessions.isEmpty()) {
                break;
            }
            
            Instant now = Instant.now();
            
            for (SafeJourneySession session : sessions) {
                lastId = session.getId();
                Instant lastHeartbeat = session.getLastHeartbeatTime() != null ? session.getLastHeartbeatTime() : session.getStartTime();
                long minutesSinceHeartbeat = ChronoUnit.MINUTES.between(lastHeartbeat, now);
                
                if (minutesSinceHeartbeat > 10 && session.getStatus() != SafeJourneySession.JourneyStatus.DEVICE_UNAVAILABLE) {
                    session.setStatus(SafeJourneySession.JourneyStatus.DEVICE_UNAVAILABLE);
                    journeyRepo.save(session);
                    log.info("Journey {} marked DEVICE_UNAVAILABLE (no heartbeat for >10m)", session.getId());
                    
                    UUID deterministicEventId = UUID.nameUUIDFromBytes(String.format("heartbeat-%s-DEVICE_UNAVAILABLE", session.getId()).getBytes(java.nio.charset.StandardCharsets.UTF_8));
                    eventProducer.publishEvent(deterministicEventId, session.getId(), JourneyEvent.EventType.DEVICE_UNAVAILABLE, java.util.Map.of(
                        "lastHeartbeatTime", lastHeartbeat
                    ));
                } else if (minutesSinceHeartbeat > 5 && session.getStatus() == SafeJourneySession.JourneyStatus.ACTIVE) {
                    session.setStatus(SafeJourneySession.JourneyStatus.CONNECTION_LOST);
                    journeyRepo.save(session);
                    log.info("Journey {} marked CONNECTION_LOST (no heartbeat for >5m)", session.getId());
                    
                    UUID deterministicEventId = UUID.nameUUIDFromBytes(String.format("heartbeat-%s-CONNECTION_LOST", session.getId()).getBytes(java.nio.charset.StandardCharsets.UTF_8));
                    eventProducer.publishEvent(deterministicEventId, session.getId(), JourneyEvent.EventType.CONNECTION_LOST, java.util.Map.of(
                        "lastHeartbeatTime", lastHeartbeat
                    ));
                }
            }
            
            if (sessions.size() < size) {
                break;
            }
        }
    }
}
