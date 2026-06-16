package com.aegis.dto.request;

import jakarta.validation.constraints.NotBlank;

public record EvidenceRequest(
    @NotBlank String type,
    String description
) {}
