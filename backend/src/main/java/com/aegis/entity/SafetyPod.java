package com.aegis.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "safety_pods", indexes = {
    @Index(name = "idx_sp_code", columnList = "code")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SafetyPod {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 6)
    private String code;

    @Column(nullable = false)
    @Builder.Default
    private Integer members = 1;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Column(name = "creator_name", nullable = false, length = 120)
    private String creatorName;

    @Column(name = "member_names", columnDefinition = "TEXT")
    private String memberNames;

    @Column(name = "sos_triggered_by", length = 120)
    private String sosTriggeredBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
