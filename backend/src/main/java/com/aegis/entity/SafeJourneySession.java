package com.aegis.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "safe_journey_sessions", indexes = {
    @Index(name = "idx_sjs_user", columnList = "user_id"),
    @Index(name = "idx_sjs_status", columnList = "status"),
    @Index(name = "idx_sjs_arrival", columnList = "expected_arrival_time")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SafeJourneySession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "source_lat", nullable = false)
    private Double sourceLat;

    @Column(name = "source_lng", nullable = false)
    private Double sourceLng;

    @Column(name = "destination_lat", nullable = false)
    private Double destinationLat;

    @Column(name = "destination_lng", nullable = false)
    private Double destinationLng;

    @Column(name = "source_label", length = 300)
    private String sourceLabel;

    @Column(name = "destination_label", length = 300)
    private String destinationLabel;

    @Column(name = "start_time", nullable = false)
    private Instant startTime;

    @Column(name = "expected_arrival_time", nullable = false)
    private Instant expectedArrivalTime;

    @Column(name = "expected_duration_min", nullable = false)
    private Integer expectedDurationMin;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private JourneyStatus status = JourneyStatus.ACTIVE;

    @Column(name = "last_known_lat")
    private Double lastKnownLat;

    @Column(name = "last_known_lng")
    private Double lastKnownLng;

    @Column(name = "last_heartbeat_time")
    private Instant lastHeartbeatTime;

    @Column(name = "distance_to_dest_m")
    private Double distanceToDestM;

    @Column(name = "missed_checkpoints", nullable = false)
    @Builder.Default
    private Integer missedCheckpoints = 0;

    @Column(name = "total_checkpoints", nullable = false)
    @Builder.Default
    private Integer totalCheckpoints = 0;

    @Column(name = "stopped_since")
    private Instant stoppedSince;

    @Column(name = "suspicious_stop_score", nullable = false)
    @Builder.Default
    private Integer suspiciousStopScore = 0;

    @Column(name = "escalation_level", nullable = false)
    @Builder.Default
    private Integer escalationLevel = 0;

    @Column(name = "guardian_alerted_at")
    private Instant guardianAlertedAt;

    @Column(name = "police_alerted_at")
    private Instant policeAlertedAt;

    @Version
    @Column(name = "version")
    private Long version;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public enum JourneyStatus {
        ACTIVE,
        CONNECTION_LOST,
        DEVICE_UNAVAILABLE,
        COMPLETED,
        SOS,
        CANCELLED,
        AUTO_ESCALATION_PENDING
    }
}
