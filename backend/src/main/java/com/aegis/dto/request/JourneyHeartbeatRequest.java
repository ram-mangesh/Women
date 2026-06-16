package com.aegis.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class JourneyHeartbeatRequest {
    @NotNull
    private Double latitude;
    
    @NotNull
    private Double longitude;
    
    private Double speed;
    
    private Integer battery;
}
