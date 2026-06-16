package com.recoverai.request;

import com.recoverai.entity.VitalReading.ReadingSource;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class VitalReadingRequest {
    
    private Integer heartRate;
    private Integer systolicBP;
    private Integer diastolicBP;
    private Integer oxygenSaturation;
    private Double bodyTemperature;
    private Integer respiratoryRate;
    private Integer bloodGlucose;
    private Integer steps;
    private Double caloriesBurned;
    private Integer sleepMinutes;
    private Double distanceKm;
    
    @NotNull(message = "Source is required")
    private ReadingSource source;
    
    private String deviceId;
    private String deviceModel;
    private LocalDateTime recordedAt;
}
