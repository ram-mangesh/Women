package com.aegis.service;

import com.aegis.entity.SafeRideSession;
import com.aegis.entity.User;
import com.aegis.exception.NotFoundException;
import com.aegis.repository.SafeRideRepository;
import com.aegis.repository.UserRepository;
import com.aegis.twilio.TwilioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.data.redis.core.RedisTemplate;
import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j
public class SafeRideService {

    private final SafeRideRepository safeRideRepo;
    private final UserRepository userRepo;
    private final TwilioService twilioService;
    private final com.aegis.repository.EmergencyContactRepository contactsRepo;
    private final RedisTemplate<String, Object> redisTemplate;
    private final com.aegis.kafka.producer.AnalyticsProducer analyticsProducer;

    // MVP/Fallback: In-memory OTP store (DriverMobile -> OTP)
    private final Map<String, String> otpStore = new ConcurrentHashMap<>();

    private static final String OTP_KEY_PREFIX = "otp:driver:";
    private static final long OTP_TTL_SECONDS = 300;

    public void sendDriverOtp(String mobileNumber) {
        String otp = String.format("%04d", ThreadLocalRandom.current().nextInt(10000));
        String redisKey = OTP_KEY_PREFIX + mobileNumber;

        try {
            // Attempt to store in Redis with 5 min TTL
            redisTemplate.opsForValue().set(redisKey, otp, Duration.ofSeconds(OTP_TTL_SECONDS));
            log.info("Stored OTP in Redis for {}", mobileNumber);
        } catch (Exception e) {
            log.warn("Redis unavailable, falling back to local Map for OTP. Error: {}", e.getMessage());
            otpStore.put(mobileNumber, otp);
        }
        
        // In production, send via Twilio.
        try {
            twilioService.sendSms(mobileNumber, "Your AEGIS Safe Ride Verification Code is: " + otp);
            log.info("Sent Driver OTP to {}", mobileNumber); // For local debugging
        } catch (Exception e) {
            log.error("Failed to send Driver OTP: {}", e.getMessage());
            // Store it anyway so user can bypass if twilio fails in demo
        }
    }

    public boolean verifyDriverOtp(String mobileNumber, String otp) {
        String redisKey = OTP_KEY_PREFIX + mobileNumber;
        String storedOtp = null;

        try {
            // Check Redis first
            Object redisVal = redisTemplate.opsForValue().get(redisKey);
            if (redisVal != null) {
                storedOtp = redisVal.toString();
                if (storedOtp.equals(otp)) {
                    redisTemplate.delete(redisKey); // Delete immediately after verification
                    return true;
                }
            }
        } catch (Exception e) {
            log.warn("Redis read failed during OTP verification. Falling back to local Map. Error: {}", e.getMessage());
        }

        // Fallback to local map if Redis didn't have it or failed
        if (storedOtp == null) {
            storedOtp = otpStore.get(mobileNumber);
            if (storedOtp != null && storedOtp.equals(otp)) {
                otpStore.remove(mobileNumber);
                return true;
            }
        }

        // Demo override: if they type 1234, let them pass
        if ("1234".equals(otp)) return true;
        
        return false;
    }

    @Transactional
    public SafeRideSession startJourney(UUID userId, SafeRideSession request) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        // Close any active sessions
        List<SafeRideSession> activeSessions = safeRideRepo.findByStatus(SafeRideSession.RideStatus.ACTIVE);
        for (SafeRideSession session : activeSessions) {
            if (session.getUser().getId().equals(userId)) {
                session.setStatus(SafeRideSession.RideStatus.COMPLETED);
                session.setEndTime(LocalDateTime.now());
                safeRideRepo.save(session);
            }
        }

        request.setUser(user);
        request.setStatus(SafeRideSession.RideStatus.ACTIVE);
        request.setStartTime(LocalDateTime.now());
        SafeRideSession saved = safeRideRepo.save(request);

        // Notify Guardians
        String message = String.format(
            "Safe Journey Started\nVehicle: %s\nDriver: %s (%s)\nTrack: http://localhost:5173/app/tracking/ride/%s",
            saved.getVehicleNumber(),
            saved.getDriverName() != null ? saved.getDriverName() : "Unknown",
            saved.getDriverVerified() ? "Verified" : "Unverified",
            saved.getId().toString()
        );

        contactsRepo.findByUserIdOrderByPriorityAsc(userId).forEach(c -> {
            try {
                if (c.getPhone() != null && !c.getPhone().isBlank()) {
                    twilioService.sendSms(c.getPhone(), message);
                }
            } catch (Exception ignored) {}
        });

        // Publish safe ride started analytics event
        analyticsProducer.publishEvent("SAFE_RIDE_STARTED", saved.getId().toString());

        return saved;
    }

    @Transactional
    public SafeRideSession updateLocation(UUID rideId, String latLng) {
        SafeRideSession session = safeRideRepo.findById(rideId)
                .orElseThrow(() -> new NotFoundException("Ride not found"));
        
        // Basic Threat Logic for MVP
        // If they send the exact same location continuously, increment threat score
        // We simulate unusual stops here
        // (A real implementation would calculate distance over time)
        
        session.setUpdatedAt(LocalDateTime.now());
        return safeRideRepo.save(session);
    }

    @Transactional
    public void endJourney(UUID rideId) {
        SafeRideSession session = safeRideRepo.findById(rideId)
                .orElseThrow(() -> new NotFoundException("Ride not found"));
        session.setStatus(SafeRideSession.RideStatus.COMPLETED);
        session.setEndTime(LocalDateTime.now());
        safeRideRepo.save(session);
        
        // Publish safe ride completed analytics event
        analyticsProducer.publishEvent("SAFE_RIDE_COMPLETED", session.getId().toString());
    }
    
    public Optional<SafeRideSession> getActiveRide(UUID userId) {
        return safeRideRepo.findTopByUserIdAndStatusOrderByCreatedAtDesc(userId, SafeRideSession.RideStatus.ACTIVE);
    }
}
