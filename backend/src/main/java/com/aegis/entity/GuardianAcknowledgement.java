package com.aegis.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "guardian_acknowledgements")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GuardianAcknowledgement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "escalation_id", nullable = false)
    private UUID escalationId;

    @Column(name = "guardian_id", nullable = false)
    private UUID guardianId;

    @Column(name = "ack_time", nullable = false)
    private Instant ackTime;

    @Column(name = "ack_type", length = 50)
    private String ackType;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
