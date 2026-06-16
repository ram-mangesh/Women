package com.aegis.dto.response;

import java.util.Map;

/** Generic error envelope used across the API. */
public record ErrorResponse(
    int status,
    String error,
    String message,
    String path,
    long timestamp,
    Map<String, String> fieldErrors
) {
    public static ErrorResponse of(int status, String error, String message, String path) {
        return new ErrorResponse(status, error, message, path, System.currentTimeMillis(), null);
    }
}
