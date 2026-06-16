package com.aegis.dto.request;

import com.aegis.entity.IncidentReport;
import jakarta.validation.constraints.*;

public record IncidentReportRequest(
    @NotBlank String areaName,
    Double latitude,
    Double longitude,
    @NotNull IncidentReport.Type type,
    @NotNull @Min(1) @Max(5) Short severity,
    String description,
    @NotNull Boolean isAnonymous
) {}
