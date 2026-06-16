package com.aegis.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "aegis.jwt")
public record JwtProperties(
    String secret,
    long accessExpiryMs,
    long refreshExpiryMs,
    String issuer
) {}
