package com.aegis.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "journey_checkpoints", indexes = {
    @Index(name = "idx_jcp_journey", columnList = "journey_id"),
    @Index(name = "idx_jcp_scheduled", columnList = "scheduled_at, status")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class JourneyCheckpoint {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "journey_id", nullable = false)
    private SafeJourneySession journey;

    @Column(name = "checkpoint_minute", nullable = false)
    private Integer checkpointMinute;

    @Column(name = "scheduled_at", nullable = false)
    private Instant scheduledAt;

    @Column(name = "response_window_sec", nullable = false)
    @Builder.Default
    private Integer responseWindowSec = 60;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private CheckpointStatus status = CheckpointStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "response_action", length = 20)
    private ResponseAction responseAction;

    @Column(name = "responded_at")
    private Instant respondedAt;

    @Column(name = "notification_sent", nullable = false)
    @Builder.Default
    private Boolean notificationSent = false;

    @Column(name = "notification_sent_at")
    private Instant notificationSentAt;

    @Version
    @Column(name = "version")
    private Long version;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public enum CheckpointStatus {
        PENDING,
        CONFIRMED,
        MISSED,
        SOS_TRIGGERED
    }

    public enum ResponseAction {
        YES,
        NEED_HELP
    }
}
