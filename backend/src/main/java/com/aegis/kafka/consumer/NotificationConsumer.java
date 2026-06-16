package com.aegis.kafka.consumer;

import com.aegis.config.KafkaTopics;
import com.aegis.twilio.TwilioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationConsumer {

    private final TwilioService twilioService;

    @KafkaListener(topics = KafkaTopics.NOTIFICATIONS_SMS_TOPIC, groupId = "aegis-api-group")
    public void consumeSmsEvent(Map<String, Object> payload) {
        log.info("Received Kafka SMS Event: {}", payload);
        
        String phone = (String) payload.get("phoneNumber");
        String message = (String) payload.get("message");
        String type = (String) payload.getOrDefault("type", "SMS");
        
        if (phone != null && message != null) {
            switch (type) {
                case "SMS":
                    twilioService.sendSms(phone, message);
                    break;
                case "WHATSAPP":
                    twilioService.sendWhatsApp(phone, message);
                    break;
                case "VOICE":
                    twilioService.placeVoiceCallWithTwiml(phone, message);
                    break;
            }
            log.info("Successfully dispatched {} via Twilio to {}", type, phone);
        } else {
            log.warn("Invalid payload received in Kafka Topic, dropping: {}", payload);
        }
    }
}
