package com.aegis.dto.response;

import java.time.Instant;
import java.util.UUID;

public record EvidenceBlockResponse(
    UUID id,
    Long blockIndex,
    Instant timestamp,
    String type,
    String description,
    String prevHash,
    String hash,
    Boolean tampered,
    UUID userId
) {}
