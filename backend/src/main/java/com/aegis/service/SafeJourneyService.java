package com.aegis.service;

import com.aegis.dto.request.BulkHeartbeatRequest;
import com.aegis.dto.request.ConfirmArrivalRequest;
import com.aegis.dto.request.JourneyHeartbeatRequest;
import com.aegis.dto.request.StartJourneyRequest;
import com.aegis.dto.response.JourneyResponse;
import com.aegis.entity.JourneyCheckpoint;
import com.aegis.entity.SafeJourneySession;
import com.aegis.entity.User;
import com.aegis.entity.GuardianAcknowledgement;
import com.aegis.exception.NotFoundException;
import com.aegis.kafka.dto.JourneyEvent;
import com.aegis.kafka.producer.JourneyEventProducer;
import com.aegis.repository.JourneyCheckpointRepository;
import com.aegis.repository.SafeJourneyRepository;
import com.aegis.repository.UserRepository;
import com.aegis.repository.GuardianAcknowledgementRepository;
import com.aegis.repository.JourneyEscalationRecordRepository;
import com.aegis.repository.EmergencyContactRepository;
import com.aegis.entity.JourneyEscalationRecord;
import com.aegis.entity.EmergencyContact;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SafeJourneyService {

    /** Maximum plausible device speed for GPS jump validation (45 m/s ≈ 162 km/h). */
    private static final double MAX_VALID_SPEED_MS = 45.0;

    private final SafeJourneyRepository journeyRepo;
    private final JourneyCheckpointRepository checkpointRepo;
    private final UserRepository userRepo;
    private final RedisTemplate<String, Object> redisTemplate;
    private final JourneyEventProducer eventProducer;
    private final GuardianAcknowledgementRepository ackRepo;
    private final JourneyEscalationRecordRepository escalationRepo;
    private final EmergencyContactRepository contactRepo;

    // ─────────────────────────────────────────────────────────────────────────
    // Journey lifecycle
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public JourneyResponse startJourney(UUID userId, StartJourneyRequest request) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Instant now = Instant.now();
        Instant expectedArrival = now.plus(request.getExpectedDurationMinutes(), ChronoUnit.MINUTES);

        SafeJourneySession session = SafeJourneySession.builder()
                .user(user)
                .sourceLat(request.getSourceLat())
                .sourceLng(request.getSourceLng())
                .destinationLat(request.getDestinationLat())
                .destinationLng(request.getDestinationLng())
                .sourceLabel(request.getSourceLabel())
                .destinationLabel(request.getDestinationLabel())
                .startTime(now)
                .expectedArrivalTime(expectedArrival)
                .expectedDurationMin(request.getExpectedDurationMinutes())
                .status(SafeJourneySession.JourneyStatus.ACTIVE)
                .missedCheckpoints(0)
                .totalCheckpoints(4)
                .suspiciousStopScore(0)
                .escalationLevel(0)
                .build();

        SafeJourneySession savedSession = journeyRepo.save(session);

        // Generate dynamic checkpoints at 25%, 50%, 75%, 95%
        List<Double> percentages = Arrays.asList(0.25, 0.50, 0.75, 0.95);
        for (Double pct : percentages) {
            int minute = (int) (request.getExpectedDurationMinutes() * pct);
            Instant scheduledTime = now.plus(minute, ChronoUnit.MINUTES);

            JourneyCheckpoint cp = JourneyCheckpoint.builder()
                    .journey(savedSession)
                    .checkpointMinute(minute)
                    .scheduledAt(scheduledTime)
                    .responseWindowSec(60)
                    .status(JourneyCheckpoint.CheckpointStatus.PENDING)
                    .build();
            checkpointRepo.save(cp);

            try {
                redisTemplate.opsForValue().set(
                        "journey:checkpoint:pending:" + savedSession.getId() + ":" + cp.getId(),
                        cp, 24, java.util.concurrent.TimeUnit.HOURS);
            } catch (Exception e) {
                log.warn("Redis failure while caching checkpoint: {}", e.getMessage());
            }
        }

        try {
            redisTemplate.opsForValue().set("journey:session:" + savedSession.getId(),
                    savedSession, 24, java.util.concurrent.TimeUnit.HOURS);
        } catch (Exception e) {
            log.warn("Redis failure while caching journey session: {}", e.getMessage());
        }

        eventProducer.publishEvent(savedSession.getId(), JourneyEvent.EventType.JOURNEY_STARTED, Map.of(
                "userId", savedSession.getUser().getId(),
                "destinationLat", savedSession.getDestinationLat(),
                "destinationLng", savedSession.getDestinationLng(),
                "expectedDurationMin", savedSession.getExpectedDurationMin()
        ));

        return JourneyResponse.from(savedSession);
    }

    @Transactional
    public void confirmArrival(UUID userId, UUID journeyId, ConfirmArrivalRequest request) {
        // Verify session exists and belongs to this user (lightweight check, no entity load)
        if (!journeyRepo.existsByIdAndUserId(journeyId, userId)) {
            throw new NotFoundException("Journey not found or unauthorized");
        }

        Instant now = Instant.now();

        // Direct UPDATE bypasses @Version optimistic locking — prevents
        // ObjectOptimisticLockingFailureException when JourneyCheckpointEvaluator
        // or JourneyHeartbeatMonitor scheduler runs concurrently on the same row.
        int updated = journeyRepo.setCompletedDirect(
                journeyId, userId,
                SafeJourneySession.JourneyStatus.COMPLETED,
                now
        );

        if (updated == 0) {
            log.warn("[confirmArrival] No rows updated for journey {} — may already be completed", journeyId);
        }

        try {
            redisTemplate.delete(Arrays.asList("journey:session:" + journeyId, "journey:heartbeat:" + journeyId));
        } catch (Exception e) {
            log.warn("Redis failure while clearing cache: {}", e.getMessage());
        }

        // Use String for Instant to avoid Jackson serialization issues in Kafka payload
        eventProducer.publishEvent(journeyId, JourneyEvent.EventType.JOURNEY_COMPLETED, Map.of(
                "completedAt", now.toString()
        ));

        log.info("[confirmArrival] Journey {} confirmed as COMPLETED by user {}", journeyId, userId);
    }

    @Transactional
    public void cancelJourney(UUID userId, UUID journeyId) {
        SafeJourneySession session = getAndValidateSession(userId, journeyId);

        session.setStatus(SafeJourneySession.JourneyStatus.CANCELLED);

        journeyRepo.save(session);

        try {
            redisTemplate.delete(Arrays.asList("journey:session:" + journeyId, "journey:heartbeat:" + journeyId));
        } catch (Exception e) {
            log.warn("Redis failure while clearing cache: {}", e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public JourneyResponse getJourney(UUID userId, UUID journeyId) {
        SafeJourneySession session = null;
        try {
            session = (SafeJourneySession) redisTemplate.opsForValue().get("journey:session:" + journeyId);
        } catch (Exception e) {
            log.warn("Redis failure while getting journey cache: {}", e.getMessage());
        }

        if (session != null) {
            if (!session.getUser().getId().equals(userId)) {
                throw new NotFoundException("Journey not found or unauthorized");
            }
            return JourneyResponse.from(session);
        }

        session = getAndValidateSession(userId, journeyId);

        try {
            redisTemplate.opsForValue().set("journey:session:" + journeyId,
                    session, 24, java.util.concurrent.TimeUnit.HOURS);
        } catch (Exception e) {
            log.warn("Redis failure while caching journey session: {}", e.getMessage());
        }

        return JourneyResponse.from(session);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Heartbeat (single + bulk)
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public void receiveHeartbeat(UUID userId, UUID journeyId, JourneyHeartbeatRequest request) {
        SafeJourneySession session = getAndValidateSession(userId, journeyId);

        session.setLastKnownLat(request.getLatitude());
        session.setLastKnownLng(request.getLongitude());
        session.setLastHeartbeatTime(Instant.now());

        double distM = haversineDistanceMeters(
                request.getLatitude(), request.getLongitude(),
                session.getDestinationLat(), session.getDestinationLng()
        );
        session.setDistanceToDestM(distM);

        SafeJourneySession savedSession = journeyRepo.save(session);

        try {
            redisTemplate.opsForValue().set("journey:heartbeat:" + journeyId,
                    Instant.now().toEpochMilli(), 30, java.util.concurrent.TimeUnit.MINUTES);
            redisTemplate.opsForValue().set("journey:session:" + journeyId,
                    savedSession, 24, java.util.concurrent.TimeUnit.HOURS);
        } catch (Exception e) {
            log.warn("Redis failure while caching heartbeat: {}", e.getMessage());
        }
    }

    /**
     * Bulk heartbeat sync — used when the device was offline.
     * Points are sorted by client timestamp, speed-validated, and applied in order.
     * Returns the count of accepted (non-rejected) points.
     */
    @Transactional
    public int syncBulkHeartbeats(UUID userId, UUID journeyId, BulkHeartbeatRequest request) {
        SafeJourneySession session = getAndValidateSession(userId, journeyId);

        // Sort ascending by client timestamp to preserve ordering
        List<BulkHeartbeatRequest.HeartbeatPoint> sorted = request.getPoints().stream()
                .sorted(Comparator.comparingLong(BulkHeartbeatRequest.HeartbeatPoint::getTimestampEpochMs))
                .toList();

        int accepted = 0;
        Double prevLat = session.getLastKnownLat();
        Double prevLng = session.getLastKnownLng();
        Instant prevTime = session.getLastHeartbeatTime() != null
                ? session.getLastHeartbeatTime()
                : session.getStartTime();

        for (BulkHeartbeatRequest.HeartbeatPoint point : sorted) {
            Instant pointTime = Instant.ofEpochMilli(point.getTimestampEpochMs());

            // Reject points older than the last recorded heartbeat
            if (!pointTime.isAfter(prevTime)) {
                log.debug("Bulk heartbeat point rejected: timestamp {} is not after previous {}", pointTime, prevTime);
                continue;
            }

            // Speed validation — reject impossible GPS jumps
            if (prevLat != null && prevLng != null) {
                double distanceM = haversineDistanceMeters(prevLat, prevLng, point.getLatitude(), point.getLongitude());
                double elapsedSec = (double) (pointTime.toEpochMilli() - prevTime.toEpochMilli()) / 1000.0;
                if (elapsedSec > 0) {
                    double computedSpeed = distanceM / elapsedSec;
                    if (computedSpeed > MAX_VALID_SPEED_MS) {
                        log.warn("Bulk heartbeat point rejected for journey {}: speed {} m/s exceeds limit", journeyId, String.format("%.1f", computedSpeed));
                        continue;
                    }
                }
            }

            prevLat = point.getLatitude();
            prevLng = point.getLongitude();
            prevTime = pointTime;
            accepted++;

            // Track the most recent valid values (all points update session; final save persists last)
            session.setLastKnownLat(prevLat);
            session.setLastKnownLng(prevLng);
            session.setLastHeartbeatTime(prevTime);
        }

        if (accepted > 0) {
            double distM = haversineDistanceMeters(
                    session.getLastKnownLat(), session.getLastKnownLng(),
                    session.getDestinationLat(), session.getDestinationLng()
            );
            session.setDistanceToDestM(distM);

            SafeJourneySession savedSession = journeyRepo.save(session);

            try {
                redisTemplate.opsForValue().set("journey:heartbeat:" + journeyId,
                        session.getLastHeartbeatTime().toEpochMilli(), 30, java.util.concurrent.TimeUnit.MINUTES);
                redisTemplate.opsForValue().set("journey:session:" + journeyId,
                        savedSession, 24, java.util.concurrent.TimeUnit.HOURS);
            } catch (Exception e) {
                log.warn("Redis failure while caching bulk heartbeat: {}", e.getMessage());
            }

            log.info("Bulk heartbeat sync for journey {}: accepted {}/{} points",
                    journeyId, accepted, sorted.size());
        }

        return accepted;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Escalation acknowledgement
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public void acknowledgeEscalation(UUID authenticatedUserId, UUID escalationId,
                                      com.aegis.dto.request.GuardianAckRequest request) {
        JourneyEscalationRecord escalation = escalationRepo.findById(escalationId)
                .orElseThrow(() -> new NotFoundException("Escalation record not found"));

        SafeJourneySession session = escalation.getJourney();
        User authenticatedUser = userRepo.findById(authenticatedUserId)
                .orElseThrow(() -> new NotFoundException("Authenticated user not found"));

        boolean isOwner = session.getUser().getId().equals(authenticatedUserId);

        List<EmergencyContact> contacts = contactRepo.findByUserIdOrderByPriorityAsc(session.getUser().getId());
        boolean isGuardian = contacts.stream().anyMatch(c ->
                (c.getPhone() != null && authenticatedUser.getPhone() != null &&
                 c.getPhone().replaceAll("\\s+", "").replaceAll("-", "")
                  .equals(authenticatedUser.getPhone().replaceAll("\\s+", "").replaceAll("-", ""))) ||
                (c.getEmail() != null && authenticatedUser.getEmail() != null &&
                 c.getEmail().equalsIgnoreCase(authenticatedUser.getEmail()))
        );

        if (!isOwner && !isGuardian) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Unauthorized to acknowledge this escalation");
        }

        escalation.setEscalationStatus("ACKNOWLEDGED");
        escalationRepo.save(escalation);

        GuardianAcknowledgement ack = GuardianAcknowledgement.builder()
                .escalationId(escalationId)
                .guardianId(request.getGuardianId())
                .ackTime(Instant.now())
                .ackType(request.getAckType())
                .build();
        ackRepo.save(ack);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Internal helpers
    // ─────────────────────────────────────────────────────────────────────────

    private SafeJourneySession getAndValidateSession(UUID userId, UUID journeyId) {
        return journeyRepo.findByIdAndUserId(journeyId, userId)
                .orElseThrow(() -> new NotFoundException("Journey not found or unauthorized"));
    }

    private double haversineDistanceMeters(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371000; // Earth radius in metres
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                  * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
