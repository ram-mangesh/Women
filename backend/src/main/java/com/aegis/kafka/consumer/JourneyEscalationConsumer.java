package com.aegis.kafka.consumer;

import com.aegis.config.KafkaTopics;
import com.aegis.entity.EmergencyContact;
import com.aegis.entity.SafeJourneySession;
import com.aegis.kafka.dto.JourneyEvent;
import com.aegis.kafka.producer.NotificationProducer;
import com.aegis.repository.EmergencyContactRepository;
import com.aegis.repository.SafeJourneyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class JourneyEscalationConsumer {

    private final SafeJourneyRepository journeyRepo;
    private final EmergencyContactRepository contactRepo;
    private final NotificationProducer notificationProducer;
    private final RedisTemplate<String, Object> redisTemplate;

    @KafkaListener(topics = KafkaTopics.JOURNEY_EVENTS_TOPIC, groupId = "aegis-escalation-group")
    @Transactional
    public void consumeEscalationEvent(JourneyEvent event) {
        String eventTypeStr = event.getEventType();
        
        if (isNotEscalationEvent(eventTypeStr)) {
            return; // Only process escalation events
        }
        
        log.info("Processing escalation event: {} for journey: {}", eventTypeStr, event.getJourneyId());
        
        Optional<SafeJourneySession> sessionOpt = journeyRepo.findById(event.getJourneyId());
        if (sessionOpt.isEmpty()) {
            log.warn("Journey {} not found for event {}", event.getJourneyId(), event.getEventId());
            return;
        }
        
        SafeJourneySession session = sessionOpt.get();
        List<EmergencyContact> contacts = contactRepo.findByUserIdOrderByPriorityAsc(session.getUser().getId());
        
        if (contacts.isEmpty()) {
            log.warn("No emergency contacts found for user {}", session.getUser().getId());
            return;
        }

        int escalationLevel = determineEscalationLevel(eventTypeStr, session.getEscalationLevel());
        session.setEscalationLevel(escalationLevel);
        journeyRepo.save(session);

        try {
            redisTemplate.delete("journey:session:" + session.getId());
        } catch (Exception e) {
            log.warn("Redis failure while evicting cached session: {}", e.getMessage());
        }

        String notificationType = getNotificationTypeForLevel(escalationLevel);
        String message = buildMessage(eventTypeStr, session);

        for (EmergencyContact contact : contacts) {
            String idempotencyKey = String.format("journey:notify:%s:%s:%s", 
                event.getEventId(), contact.getPhone(), notificationType);
                
            Boolean isNew = false;
            try {
                isNew = redisTemplate.opsForValue().setIfAbsent(idempotencyKey, "SENT", 24, TimeUnit.HOURS);
            } catch (Exception e) {
                log.warn("Redis failure in escalation consumer, falling back to fail-safe notification dispatch: {}", e.getMessage());
                isNew = true; // Fail-safe: always notify when Redis is down
            }
            
            if (Boolean.TRUE.equals(isNew)) {
                log.info("Dispatching {} to contact {}", notificationType, contact.getPhone());
                notificationProducer.sendNotificationEvent(contact.getPhone(), message, notificationType);
            } else {
                log.info("Duplicate notification prevented for contact {}", contact.getPhone());
            }
        }
    }

    private boolean isNotEscalationEvent(String eventType) {
        return eventType.equals("JOURNEY_STARTED") || eventType.equals("JOURNEY_COMPLETED");
    }

    private int determineEscalationLevel(String eventType, int currentLevel) {
        if (eventType.equals("AUTO_ESCALATION")) {
            return 3;
        } else if (eventType.equals("SUSPICIOUS_STOP")) {
            return Math.max(currentLevel, 2);
        } else {
            return Math.max(currentLevel, 1);
        }
    }

    private String getNotificationTypeForLevel(int level) {
        if (level >= 3) return "VOICE";
        if (level == 2) return "WHATSAPP";
        return "SMS";
    }

    private String buildMessage(String eventType, SafeJourneySession session) {
        return String.format("AEGIS ALERT: Journey event [%s] triggered for your contact. Last known location: %s, %s", 
            eventType, session.getLastKnownLat(), session.getLastKnownLng());
    }
}
