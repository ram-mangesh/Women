package com.aegis.dto.request;

import com.aegis.entity.SOSAlert;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record SOSRequest(
    @NotNull SOSAlert.Trigger triggerType,
    @NotNull @Min(-90) @Max(90) Double latitude,
    @NotNull @Min(-180) @Max(180) Double longitude,
    String areaName,
    @Min(0) @Max(100) Short batteryPct,
    BigDecimal speedMps,
    @Min(30) @Max(220) Short heartRate
) {}
