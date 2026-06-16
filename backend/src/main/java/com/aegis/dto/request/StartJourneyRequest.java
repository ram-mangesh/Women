package com.aegis.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StartJourneyRequest {
    @NotNull
    private Double sourceLat;
    
    @NotNull
    private Double sourceLng;
    
    @NotNull
    private Double destinationLat;
    
    @NotNull
    private Double destinationLng;
    
    private String sourceLabel;
    
    private String destinationLabel;
    
    @NotNull
    @Min(1)
    private Integer expectedDurationMinutes;
}
