package com.aegis.dto.response;

import com.aegis.entity.SafeJourneySession;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class JourneyResponse {
    private UUID id;
    private String status;
    private Double sourceLat;
    private Double sourceLng;
    private Double destinationLat;
    private Double destinationLng;
    private String sourceLabel;
    private String destinationLabel;
    private Instant startTime;
    private Instant expectedArrivalTime;
    private Integer expectedDurationMin;
    private Double lastKnownLat;
    private Double lastKnownLng;
    private Double distanceToDestM;
    private Integer missedCheckpoints;
    private Integer escalationLevel;

    public static JourneyResponse from(SafeJourneySession session) {
        return JourneyResponse.builder()
            .id(session.getId())
            .status(session.getStatus() != null ? session.getStatus().name() : null)
            .sourceLat(session.getSourceLat())
            .sourceLng(session.getSourceLng())
            .destinationLat(session.getDestinationLat())
            .destinationLng(session.getDestinationLng())
            .sourceLabel(session.getSourceLabel())
            .destinationLabel(session.getDestinationLabel())
            .startTime(session.getStartTime())
            .expectedArrivalTime(session.getExpectedArrivalTime())
            .expectedDurationMin(session.getExpectedDurationMin())
            .lastKnownLat(session.getLastKnownLat())
            .lastKnownLng(session.getLastKnownLng())
            .distanceToDestM(session.getDistanceToDestM())
            .missedCheckpoints(session.getMissedCheckpoints())
            .escalationLevel(session.getEscalationLevel())
            .build();
    }
}
