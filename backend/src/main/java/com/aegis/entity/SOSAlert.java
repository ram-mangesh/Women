package com.aegis.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "sos_alerts", indexes = {
    @Index(name = "idx_sos_user", columnList = "user_id"),
    @Index(name = "idx_sos_stat", columnList = "status"),
    @Index(name = "idx_sos_time", columnList = "created_at")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SOSAlert {

    public enum Trigger {
        MANUAL, VOICE, SHAKE, SMARTWATCH, STEALTH_PIN,
        VOLUME_PATTERN, EMOTION_AI, FALL_DETECTION, BEHAVIORAL_AI
    }

    public enum RiskLevel { LOW, MEDIUM, HIGH, CRITICAL }

    public enum Status { ACTIVE, ESCALATED, RESOLVED, DISMISSED }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "trigger_type", nullable = false, length = 60)
    private Trigger triggerType;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level", nullable = false, length = 20)
    private RiskLevel riskLevel;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal confidence;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(name = "area_name", length = 200)
    private String areaName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Status status = Status.ACTIVE;

    @Column(name = "battery_pct")
    private Short batteryPct;

    @Column(name = "speed_mps", precision = 6, scale = 2)
    private BigDecimal speedMps;

    @Column(name = "heart_rate")
    private Short heartRate;

    @Column(name = "escalated_to", length = 200)
    private String escalatedTo;

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolved_by")
    private User resolvedBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
