package com.recoverai.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "vital_readings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VitalReading {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;
    
    private Integer heartRate; // BPM
    
    private Integer systolicBP; // mmHg
    
    private Integer diastolicBP; // mmHg
    
    private Integer oxygenSaturation; // SpO2 percentage
    
    private Double bodyTemperature; // Celsius
    
    private Integer respiratoryRate; // breaths per minute
    
    private Integer bloodGlucose; // mg/dL
    
    private Integer steps;
    
    private Double caloriesBurned;
    
    private Integer sleepMinutes;
    
    private Double distanceKm;
    
    @Enumerated(EnumType.STRING)
    private ReadingSource source;
    
    private String deviceId;
    
    private String deviceModel;
    
    // AI Analysis
    private Boolean isAbnormal = false;
    
    @Column(length = 1000)
    private String abnormalityNotes;
    
    @Column(length = 1000)
    private String aiAnalysis;
    
    private Boolean alertTriggered = false;
    
    @CreationTimestamp
    @Column(updatable = false, nullable = false)
    private LocalDateTime recordedAt;
    
    private LocalDateTime syncedAt;
    
    public enum ReadingSource {
        MANUAL_ENTRY,
        FITBIT,
        APPLE_WATCH,
        GARMIN,
        SAMSUNG_HEALTH,
        GOOGLE_FIT,
        WITHINGS,
        OTHER_WEARABLE
    }
}
