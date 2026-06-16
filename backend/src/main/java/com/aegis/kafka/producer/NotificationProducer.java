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
public class NotificationProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void sendNotificationEvent(String phoneNumber, String messageText, String type) {
        Map<String, Object> payload = Map.of(
            "phoneNumber", phoneNumber,
            "message", messageText,
            "type", type,
            "priority", "HIGH"
        );
        
        if (org.springframework.transaction.support.TransactionSynchronizationManager.isActualTransactionActive()) {
            org.springframework.transaction.support.TransactionSynchronizationManager.registerSynchronization(
                new org.springframework.transaction.support.TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        kafkaTemplate.send(KafkaTopics.NOTIFICATIONS_SMS_TOPIC, phoneNumber, payload);
                        log.info("Published {} notification event for {}", type, phoneNumber);
                    }
                }
            );
        } else {
            kafkaTemplate.send(KafkaTopics.NOTIFICATIONS_SMS_TOPIC, phoneNumber, payload);
            log.info("Published {} notification event for {}", type, phoneNumber);
        }
    }
}
