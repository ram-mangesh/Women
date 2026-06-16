package com.aegis.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class GoogleFitSyncRequest {
    
    private String deviceId;
    private String deviceModel;
    private List<VitalReadingRequest> readings;
}
