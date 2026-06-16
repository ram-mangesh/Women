package com.aegis.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.Instant;
import java.util.List;

/**
 * Request body for the bulk heartbeat sync endpoint.
 * The frontend buffers GPS points locally while offline and uploads them
 * all at once when connectivity is restored.
 */
@Data
public class BulkHeartbeatRequest {

    @NotEmpty(message = "Points list must not be empty")
    @Size(max = 500, message = "Maximum 500 points per bulk upload")
    @Valid
    private List<HeartbeatPoint> points;

    @Data
    public static class HeartbeatPoint {

        @NotNull(message = "Latitude is required")
        private Double latitude;

        @NotNull(message = "Longitude is required")
        private Double longitude;

        /** Client-side timestamp when this reading was captured (epoch millis). */
        @NotNull(message = "Timestamp is required")
        private Long timestampEpochMs;

        /** Device speed in m/s reported by the GPS sensor. */
        private Double speed;

        /** Battery level 0–100 at the time of capture. */
        private Integer battery;
    }
}
