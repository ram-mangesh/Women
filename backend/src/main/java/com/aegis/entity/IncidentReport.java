package com.aegis.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "incident_reports", indexes = {
    @Index(name = "idx_ir_area", columnList = "area_name"),
    @Index(name = "idx_ir_type", columnList = "type")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class IncidentReport {

    public enum Type {
        HARASSMENT, STALKING, POOR_LIGHTING, SUSPICIOUS, CROWD, VIOLENCE, OTHER
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id")
    private User reporter;

    @Column(name = "area_name", nullable = false, length = 200)
    private String areaName;

    private Double latitude;
    private Double longitude;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 60)
    private Type type;

    @Column(nullable = false)
    private Short severity;   // 1-5

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_anonymous", nullable = false)
    @Builder.Default
    private Boolean isAnonymous = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean verified = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by")
    private User verifiedBy;

    @Column(nullable = false)
    @Builder.Default
    private Integer upvotes = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
