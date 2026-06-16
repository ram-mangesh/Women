package com.aegis.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class GuardianAckRequest {
    @NotNull
    private UUID guardianId;
    
    @NotNull
    private String ackType; // e.g., "SMS_RECEIVED", "CALL_ANSWERED"
}
