package com.aegis.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "live_locations", indexes = {
    @Index(name = "idx_ll_user_time", columnList = "user_id,recorded_at")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LiveLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(precision = 6, scale = 2)
    private BigDecimal accuracy;

    @Column(precision = 6, scale = 2)
    private BigDecimal speed;

    @Column(precision = 6, scale = 2)
    private BigDecimal heading;

    @Column(name = "battery_pct")
    private Short batteryPct;

    @CreationTimestamp
    @Column(name = "recorded_at", nullable = false, updatable = false)
    private Instant recordedAt;
}
