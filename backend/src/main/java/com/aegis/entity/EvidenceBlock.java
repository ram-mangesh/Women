package com.aegis.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "evidence_blocks", indexes = {
    @Index(name = "idx_block_index", columnList = "block_index"),
    @Index(name = "idx_block_user", columnList = "user_id")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EvidenceBlock {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "block_index", nullable = false)
    private Long blockIndex;

    @Column(name = "timestamp", nullable = false)
    private Instant timestamp;

    @Column(name = "type", nullable = false, length = 50)
    private String type;

    @Column(name = "description", nullable = false, length = 500)
    private String description;

    @Column(name = "prev_hash", nullable = false, length = 64)
    private String prevHash;

    @Column(name = "hash", nullable = false, length = 64)
    private String hash;

    @Column(name = "tampered", nullable = false)
    @Builder.Default
    private Boolean tampered = false;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
