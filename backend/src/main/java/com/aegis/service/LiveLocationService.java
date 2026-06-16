package com.aegis.service;

import com.aegis.entity.LiveLocation;
import com.aegis.repository.LiveLocationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class LiveLocationService {
    private final LiveLocationRepository repo;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String LOCATION_LATEST_PREFIX = "location:latest:user:";
    private static final long LOCATION_TTL_SECONDS = 1800;

    @SuppressWarnings("unchecked")
    public Optional<LiveLocation> latest(UUID userId) {
        String key = LOCATION_LATEST_PREFIX + userId;
        
        try {
            Object cached = redisTemplate.opsForValue().get(key);
            if (cached != null && cached instanceof java.util.Map) {
                java.util.Map<String, Object> map = (java.util.Map<String, Object>) cached;
                LiveLocation loc = new LiveLocation();
                loc.setLatitude(((Number) map.get("lat")).doubleValue());
                loc.setLongitude(((Number) map.get("lng")).doubleValue());
                if (map.get("speed") != null) loc.setSpeed(new java.math.BigDecimal(map.get("speed").toString()));
                if (map.get("battery") != null) loc.setBatteryPct(((Number) map.get("battery")).shortValue());
                if (map.get("ts") != null) loc.setRecordedAt(java.time.Instant.ofEpochMilli(((Number) map.get("ts")).longValue()));
                return Optional.of(loc);
            }
        } catch (Exception e) {
            log.warn("Redis read failed for GPS cache: {}", e.getMessage());
        }

        // Cache miss -> Read from MySQL
        Optional<LiveLocation> dbLoc = repo.findFirstByUserIdOrderByRecordedAtDesc(userId);
        
        // Repopulate Redis
        if (dbLoc.isPresent()) {
            try {
                LiveLocation l = dbLoc.get();
                java.util.Map<String, Object> map = new java.util.HashMap<>();
                map.put("lat", l.getLatitude());
                map.put("lng", l.getLongitude());
                if (l.getSpeed() != null) map.put("speed", l.getSpeed());
                if (l.getBatteryPct() != null) map.put("battery", l.getBatteryPct());
                if (l.getRecordedAt() != null) map.put("ts", l.getRecordedAt().toEpochMilli());
                
                redisTemplate.opsForValue().set(key, map, Duration.ofSeconds(LOCATION_TTL_SECONDS));
            } catch (Exception e) {
                log.warn("Redis write failed for GPS cache: {}", e.getMessage());
            }
        }
        
        return dbLoc;
    }

    public List<LiveLocation> history(UUID userId) {
        return repo.findTop50ByUserIdOrderByRecordedAtDesc(userId);
    }
}
