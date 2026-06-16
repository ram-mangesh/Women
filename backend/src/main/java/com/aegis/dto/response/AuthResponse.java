package com.aegis.dto.response;

import com.aegis.entity.User;

import java.util.UUID;

public record AuthResponse(
    String accessToken,
    String refreshToken,
    String tokenType,
    long expiresInMs,
    UUID userId,
    String fullName,
    String email,
    User.Role role
) {
    public static AuthResponse of(String access, String refresh, long expiryMs, User u) {
        return new AuthResponse(access, refresh, "Bearer", expiryMs,
            u.getId(), u.getFullName(), u.getEmail(), u.getRole());
    }
}
