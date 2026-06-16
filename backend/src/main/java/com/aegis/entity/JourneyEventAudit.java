package com.aegis.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "journey_event_audit")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class JourneyEventAudit {

    @Id
    private UUID eventId;

    @Column(name = "journey_id", nullable = false)
    private UUID journeyId;

    @Column(name = "event_type", nullable = false)
    private String eventType;

    @Column(columnDefinition = "TEXT")
    private String payloadJson;

    @CreationTimestamp
    @Column(name = "processed_at", nullable = false, updatable = false)
    private Instant processedAt;
}
