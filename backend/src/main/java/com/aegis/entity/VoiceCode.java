package com.aegis.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "voice_codes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VoiceCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** BCrypt-hashed secret phrase — never stored plaintext */
    @Column(nullable = false)
    private String phraseHash;

    /** Masked hint e.g. "C***M**" shown to user in UI */
    @Column(nullable = false)
    private String phraseHint;

    /** Original length — used for similarity check */
    private int phraseLength;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }

    @PreUpdate
    void onUpdate() { updatedAt = LocalDateTime.now(); }
}
