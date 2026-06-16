package com.aegis.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "threat_scores", indexes = {
    @Index(name = "idx_ts_user_time", columnList = "user_id,computed_at")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ThreatScore {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal score;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal confidence;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level", nullable = false, length = 20)
    private SOSAlert.RiskLevel riskLevel;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private Map<String, Object> factors;

    @CreationTimestamp
    @Column(name = "computed_at", nullable = false, updatable = false)
    private Instant computedAt;
}
