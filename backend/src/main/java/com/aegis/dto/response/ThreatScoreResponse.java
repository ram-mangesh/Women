package com.aegis.dto.response;

import java.math.BigDecimal;
import java.time.Instant;

public record ThreatScoreResponse(
    BigDecimal score,
    BigDecimal confidence,
    String riskLevel,
    java.util.Map<String, Object> factors,
    Instant computedAt
) {}
