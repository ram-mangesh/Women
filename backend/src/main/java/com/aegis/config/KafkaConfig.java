package com.aegis.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.common.TopicPartition;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.listener.DeadLetterPublishingRecoverer;
import org.springframework.kafka.listener.DefaultErrorHandler;
import org.springframework.util.backoff.FixedBackOff;

@Configuration
@EnableKafka
public class KafkaConfig {

    @Bean
    public DefaultErrorHandler errorHandler(KafkaTemplate<Object, Object> template) {
        // Send failed messages to DLQ topic automatically
        DeadLetterPublishingRecoverer recoverer = new DeadLetterPublishingRecoverer(template,
                (record, ex) -> new TopicPartition(record.topic() + ".DLQ", record.partition()));

        // Retry 3 times with 2-second backoff
        return new DefaultErrorHandler(recoverer, new FixedBackOff(2000L, 3));
    }

    @Bean
    public NewTopic journeyEventsTopic() {
        return TopicBuilder.name(KafkaTopics.JOURNEY_EVENTS_TOPIC)
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic journeyEventsDlqTopic() {
        return TopicBuilder.name(KafkaTopics.JOURNEY_EVENTS_DLQ_TOPIC)
                .partitions(1)
                .replicas(1)
                .build();
    }
}
