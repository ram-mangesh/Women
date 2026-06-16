package com.aegis;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * AEGIS — AI Women Safety Intelligence Platform
 * Enterprise Spring Boot entry point.
 */
@SpringBootApplication
@EnableJpaAuditing
@EnableCaching
@EnableAsync
@EnableScheduling
public class AegisApplication {
    public static void main(String[] args) {
        SpringApplication.run(AegisApplication.class, args);
    }
}
