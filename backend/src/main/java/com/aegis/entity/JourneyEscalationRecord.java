package com.aegis.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "journey_escalation_records", indexes = {
    @Index(name = "idx_jer_journey", columnList = "journey_id"),
    @Index(name = "idx_jer_status", columnList = "escalation_status")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class JourneyEscalationRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "journey_id", nullable = false)
    private SafeJourneySession journey;

    @Column(name = "trigger_reason", nullable = false)
    private String triggerReason;

    @Column(name = "escalation_status", nullable = false)
    private String escalationStatus;

    /** Escalation severity level (1-4). Incremented by the evaluator scheduler. */
    @Column(name = "escalation_level", nullable = false)
    @Builder.Default
    private Integer escalationLevel = 1;

    // ── Snapshot at time of escalation ────────────────────────────────────────

    /** Last known latitude captured when escalation was created. */
    @Column(name = "last_latitude")
    private Double lastLatitude;

    /** Last known longitude captured when escalation was created. */
    @Column(name = "last_longitude")
    private Double lastLongitude;

    /** Last heartbeat timestamp captured when escalation was created. */
    @Column(name = "last_heartbeat_time")
    private Instant lastHeartbeatTime;

    /** Battery level (0-100) captured when escalation was created. Null if unknown. */
    @Column(name = "battery_level")
    private Integer batteryLevel;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
