package com.aegis.service;

import com.aegis.entity.SOSAlert;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Client for the FastAPI AI microservice.
 * Falls back to deterministic heuristic if the AI service is down.
 */
@Service
@Slf4j
public class AIService {

    private final RestTemplate rest;
    private final String baseUrl;

    public AIService(RestTemplate rest, @Value("${aegis.ai.base-url}") String baseUrl) {
        this.rest = rest;
        this.baseUrl = baseUrl;
    }

    public record RiskResult(
        BigDecimal score,
        BigDecimal confidence,
        SOSAlert.RiskLevel level,
        Map<String, Object> factors
    ) {}

    public RiskResult computeRisk(java.util.UUID userId, double lat, double lng) {
        try {
            Map<String, Object> req = new java.util.HashMap<>();
            req.put("user_id", userId.toString());
            req.put("latitude", lat);
            req.put("longitude", lng);
            
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            org.springframework.http.HttpEntity<Map<String, Object>> entity = new org.springframework.http.HttpEntity<>(req, headers);
            
            @SuppressWarnings("unchecked")
            Map<String, Object> resp = rest.postForObject(baseUrl + "/ai/risk", entity, Map.class);
            if (resp != null) {
                double score = ((Number) resp.get("score")).doubleValue();
                double conf = ((Number) resp.getOrDefault("confidence", 0.85)).doubleValue();
                String lvl = (String) resp.getOrDefault("risk_level", "MEDIUM");
                @SuppressWarnings("unchecked")
                Map<String, Object> factors = (Map<String, Object>) resp.getOrDefault("factors", Map.of());
                return new RiskResult(
                    BigDecimal.valueOf(score),
                    BigDecimal.valueOf(conf),
                    SOSAlert.RiskLevel.valueOf(lvl),
                    factors
                );
            }
        } catch (Exception ex) {
            log.warn("AI service unavailable, falling back to heuristic: {}", ex.getMessage());
        }
        return fallbackHeuristic(lat, lng);
    }

    private RiskResult fallbackHeuristic(double lat, double lng) {
        // Deterministic pseudo-score from coordinates (demo only)
        int seed = Math.abs((int) ((lat * 10000) + (lng * 10000)));
        int s = 30 + (seed % 55);
        SOSAlert.RiskLevel lvl = s >= 80 ? SOSAlert.RiskLevel.CRITICAL
            : s >= 60 ? SOSAlert.RiskLevel.HIGH
            : s >= 35 ? SOSAlert.RiskLevel.MEDIUM
            : SOSAlert.RiskLevel.LOW;
        return new RiskResult(
            BigDecimal.valueOf(s),
            BigDecimal.valueOf(0.82),
            lvl,
            Map.of("mode", "heuristic-fallback", "note", "AI service offline")
        );
    }
}
