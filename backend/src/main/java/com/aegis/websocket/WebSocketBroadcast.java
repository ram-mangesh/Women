package com.aegis.websocket;

import com.aegis.dto.request.LocationUpdateRequest;
import com.aegis.dto.response.SOSAlertResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketBroadcast {

    private final SimpMessagingTemplate broker;

    public void broadcastNewSOS(SOSAlertResponse resp) {
        broker.convertAndSend("/topic/sos/new", resp);
        log.info("WS broadcast → /topic/sos/new id={}", resp.id());
    }

    public void broadcastResolved(UUID alertId) {
        broker.convertAndSend("/topic/sos/resolved", Map.of("id", alertId.toString()));
    }

    public void broadcastLocation(UUID userId, LocationUpdateRequest r) {
        java.util.Map<String, Object> payload = new java.util.HashMap<>();
        payload.put("userId", userId != null ? userId.toString() : "");
        payload.put("lat", r.latitude());
        payload.put("lng", r.longitude());
        payload.put("speed", r.speed() != null ? r.speed() : 0.0);
        payload.put("battery", r.batteryPct() != null ? r.batteryPct() : 100);
        payload.put("ts", System.currentTimeMillis());
        broker.convertAndSend("/topic/location/" + userId, payload);
    }

    public void pushToUser(UUID userId, Object payload) {
        broker.convertAndSendToUser(userId.toString(), "/queue/notifications", payload);
    }
}
