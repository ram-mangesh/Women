package com.aegis.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "safe_ride_sessions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SafeRideSession {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(length = 36, columnDefinition = "varchar(36)", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String vehicleNumber;

    @Column(columnDefinition = "LONGTEXT")
    private String vehiclePhotoUrl; // Storing base64 for MVP

    private String driverName;
    
    @Column(nullable = false)
    private String driverMobile;

    @Builder.Default
    private Boolean driverVerified = false;

    @Column(nullable = false)
    private String sourceLocation; // latitude,longitude or text

    @Column(nullable = false)
    private String destinationLocation; // latitude,longitude or text

    private LocalDateTime estimatedArrivalTime;

    @Builder.Default
    private LocalDateTime startTime = LocalDateTime.now();

    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private RideStatus status = RideStatus.ACTIVE;

    @Builder.Default
    private Integer routeDeviationCount = 0;

    @Builder.Default
    private Integer threatScore = 0;

    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum RideStatus {
        ACTIVE,
        COMPLETED,
        SOS
    }
}
