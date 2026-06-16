package com.aegis.dto.response;

import com.aegis.entity.SOSAlert;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record SOSAlertResponse(
    UUID id,
    UUID userId,
    String userName,
    SOSAlert.Trigger triggerType,
    SOSAlert.RiskLevel riskLevel,
    BigDecimal confidence,
    Double latitude,
    Double longitude,
    String areaName,
    SOSAlert.Status status,
    Short batteryPct,
    BigDecimal speedMps,
    Short heartRate,
    String escalatedTo,
    Instant createdAt,
    Instant resolvedAt
) {
    public static SOSAlertResponse from(SOSAlert a) {
        return new SOSAlertResponse(
            a.getId(),
            a.getUser().getId(),
            a.getUser().getFullName(),
            a.getTriggerType(),
            a.getRiskLevel(),
            a.getConfidence(),
            a.getLatitude(),
            a.getLongitude(),
            a.getAreaName(),
            a.getStatus(),
            a.getBatteryPct(),
            a.getSpeedMps(),
            a.getHeartRate(),
            a.getEscalatedTo(),
            a.getCreatedAt(),
            a.getResolvedAt()
        );
    }
}
