package com.aegis.kafka.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JourneyEvent {
    
    private UUID eventId;
    private UUID journeyId;
    private String eventType;
    private Long timestamp;
    private Map<String, Object> payload;

    public enum EventType {
        JOURNEY_STARTED,
        CHECKPOINT_MISSED,
        CONNECTION_LOST,
        DEVICE_UNAVAILABLE,
        SUSPICIOUS_STOP,
        AUTO_ESCALATION,
        POLICE_ESCALATION,
        JOURNEY_COMPLETED
    }
}
