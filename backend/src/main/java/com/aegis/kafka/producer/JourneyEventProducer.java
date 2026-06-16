package com.aegis.kafka.producer;

import com.aegis.config.KafkaTopics;
import com.aegis.kafka.dto.JourneyEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class JourneyEventProducer {

    private final KafkaTemplate<Object, Object> kafkaTemplate;

    public void publishEvent(UUID journeyId, JourneyEvent.EventType eventType, Map<String, Object> payload) {
        publishEvent(UUID.randomUUID(), journeyId, eventType, payload);
    }

    public void publishEvent(UUID eventId, UUID journeyId, JourneyEvent.EventType eventType, Map<String, Object> payload) {
        JourneyEvent event = JourneyEvent.builder()
                .eventId(eventId != null ? eventId : UUID.randomUUID())
                .journeyId(journeyId)
                .eventType(eventType.name())
                .timestamp(System.currentTimeMillis())
                .payload(payload)
                .build();

        if (org.springframework.transaction.support.TransactionSynchronizationManager.isActualTransactionActive()) {
            org.springframework.transaction.support.TransactionSynchronizationManager.registerSynchronization(
                new org.springframework.transaction.support.TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        dispatchKafkaEvent(event);
                    }
                }
            );
        } else {
            dispatchKafkaEvent(event);
        }
    }

    private void dispatchKafkaEvent(JourneyEvent event) {
        log.info("Publishing JourneyEvent: {}", event.getEventType());
        kafkaTemplate.send(KafkaTopics.JOURNEY_EVENTS_TOPIC, event.getJourneyId().toString(), event)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.error("Failed to publish JourneyEvent: {}", ex.getMessage());
                    } else {
                        log.debug("Successfully published JourneyEvent");
                    }
                });
    }
}
