package com.aegis.dto.request;

import jakarta.validation.constraints.NotBlank;

public record EmergencyContactRequest(
    @NotBlank String name,
    String relation,
    @NotBlank String phone,
    String email,
    Short priority
) {}
