package com.aegis.notification;

import com.aegis.websocket.WebSocketBroadcast;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final WebSocketBroadcast ws;

    public void push(UUID userId, String title, String body, String kind) {
        log.info("Notification → user={} kind={} title={}", userId, kind, title);
        ws.pushToUser(userId, Map.of(
            "title", title,
            "body", body,
            "kind", kind,
            "ts", System.currentTimeMillis()
        ));
    }
}
