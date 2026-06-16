package com.aegis.kafka.consumer;

import com.aegis.config.KafkaTopics;
import com.aegis.entity.JourneyEventAudit;
import com.aegis.kafka.dto.JourneyEvent;
import com.aegis.repository.JourneyEventAuditRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class JourneyEventConsumer {

    private final JourneyEventAuditRepository auditRepo;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = KafkaTopics.JOURNEY_EVENTS_TOPIC, groupId = "aegis-journey-group")
    @Transactional
    public void consumeEvent(JourneyEvent event) throws Exception {
        log.info("Received JourneyEvent: {} for journey: {}", event.getEventType(), event.getJourneyId());

        // Idempotency Protection
        if (auditRepo.existsById(event.getEventId())) {
            log.info("Event {} already processed. Skipping...", event.getEventId());
            return;
        }

        String payloadJson = objectMapper.writeValueAsString(event.getPayload());

        JourneyEventAudit audit = JourneyEventAudit.builder()
                .eventId(event.getEventId())
                .journeyId(event.getJourneyId())
                .eventType(event.getEventType())
                .payloadJson(payloadJson)
                .build();

        auditRepo.save(audit);
        log.info("Successfully audited JourneyEvent: {}", event.getEventId());
        
        // No further action for now. (No SMS, Twilio, WhatsApp, WebSocket)
    }
}
