package com.aegis.kafka.consumer;

import com.aegis.config.KafkaTopics;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.Map;

import org.springframework.data.redis.core.RedisTemplate;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsConsumer {

    private final RedisTemplate<String, Object> redisTemplate;

    @KafkaListener(topics = KafkaTopics.ANALYTICS_EVENTS_TOPIC, groupId = "aegis-api-group")
    public void consumeAnalyticsEvent(Map<String, Object> payload) {
        String metric = (String) payload.get("metric");
        
        try {
            // Increment the real-time Redis dashboard counter for this event type
            redisTemplate.opsForValue().increment("analytics:metrics:" + metric);
            log.info("Processed Analytics -> Incremented Redis metric: {}", metric);
        } catch (Exception e) {
            log.warn("Failed to update Redis analytics metric: {}", e.getMessage());
        }
    }
}
