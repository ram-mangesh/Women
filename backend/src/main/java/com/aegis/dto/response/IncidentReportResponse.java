package com.aegis.dto.response;

import com.aegis.entity.IncidentReport;

import java.time.Instant;
import java.util.UUID;

public record IncidentReportResponse(
    UUID id,
    String areaName,
    Double latitude,
    Double longitude,
    IncidentReport.Type type,
    Short severity,
    String description,
    Boolean isAnonymous,
    Boolean verified,
    Integer upvotes,
    String reporterName,
    Instant createdAt
) {
    public static IncidentReportResponse from(IncidentReport r) {
        String rep = (r.getIsAnonymous() || r.getReporter() == null)
            ? "Anonymous"
            : r.getReporter().getFullName();
        return new IncidentReportResponse(
            r.getId(), r.getAreaName(), r.getLatitude(), r.getLongitude(),
            r.getType(), r.getSeverity(), r.getDescription(),
            r.getIsAnonymous(), r.getVerified(), r.getUpvotes(), rep, r.getCreatedAt()
        );
    }
}
