package com.aegis.kafka.producer;

import com.aegis.config.KafkaTopics;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishEvent(String metricName, Object value) {
        Map<String, Object> payload = Map.of(
            "metric", metricName,
            "value", value,
            "timestamp", System.currentTimeMillis()
        );
        
        kafkaTemplate.send(KafkaTopics.ANALYTICS_EVENTS_TOPIC, metricName, payload);
        log.info("Published analytics event: {}", metricName);
    }
}
