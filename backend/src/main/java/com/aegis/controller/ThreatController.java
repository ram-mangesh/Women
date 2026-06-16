package com.aegis.controller;

import com.aegis.dto.response.ThreatScoreResponse;
import com.aegis.repository.ThreatScoreRepository;
import com.aegis.repository.UserRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.redis.core.RedisTemplate;
import java.time.Duration;

@RestController
@RequestMapping("/v1/threat")
@RequiredArgsConstructor
@Tag(name = "Threat", description = "AI threat-score timeline")
public class ThreatController {

    private final ThreatScoreRepository repo;
    private final UserRepository users;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String THREAT_KEY_PREFIX = "threat:user:";
    private static final long THREAT_TTL_SECONDS = 60;

    @SuppressWarnings("unchecked")
    @GetMapping
    public ResponseEntity<List<ThreatScoreResponse>> timeline(@AuthenticationPrincipal UserDetails principal) {
        UUID uid = users.findByEmail(principal.getUsername()).orElseThrow().getId();
        String redisKey = THREAT_KEY_PREFIX + uid;

        try {
            // Check cache
            Object cached = redisTemplate.opsForValue().get(redisKey);
            if (cached != null && cached instanceof List) {
                return ResponseEntity.ok((List<ThreatScoreResponse>) cached);
            }
        } catch (Exception e) {
            // Fallback to DB
        }

        // Cache miss -> Read from MySQL
        List<ThreatScoreResponse> list = repo.findTop20ByUserIdOrderByComputedAtDesc(uid)
            .stream()
            .map(t -> new ThreatScoreResponse(
                t.getScore(), t.getConfidence(),
                t.getRiskLevel().name(),
                t.getFactors(), t.getComputedAt()))
            .collect(Collectors.toList());

        // Repopulate Redis
        try {
            redisTemplate.opsForValue().set(redisKey, list, Duration.ofSeconds(THREAT_TTL_SECONDS));
        } catch (Exception e) {
            // Ignore Redis write errors
        }

        return ResponseEntity.ok(list);
    }
}
