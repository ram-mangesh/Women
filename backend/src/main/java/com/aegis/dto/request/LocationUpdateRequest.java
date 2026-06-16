package com.aegis.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record LocationUpdateRequest(
    @NotNull @Min(-90) @Max(90) Double latitude,
    @NotNull @Min(-180) @Max(180) Double longitude,
    BigDecimal accuracy,
    BigDecimal speed,
    BigDecimal heading,
    @Min(0) @Max(100) Short batteryPct
) {}
