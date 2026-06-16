package com.aegis.service;

import com.aegis.dto.request.LocationUpdateRequest;
import com.aegis.dto.request.SOSRequest;
import com.aegis.dto.response.SOSAlertResponse;
import com.aegis.entity.*;
import com.aegis.exception.NotFoundException;
import com.aegis.notification.NotificationService;
import com.aegis.repository.*;
import com.aegis.websocket.WebSocketBroadcast;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

import org.springframework.data.redis.core.RedisTemplate;

@Service
@RequiredArgsConstructor
@Slf4j
public class SOSService {

    private final UserRepository users;
    private final SOSAlertRepository alerts;
    private final EmergencyContactRepository contacts;
    private final LiveLocationRepository locations;
    private final ThreatScoreRepository scores;
    private final com.aegis.kafka.producer.NotificationProducer notificationProducer;
    private final com.aegis.kafka.producer.AnalyticsProducer analyticsProducer;
    private final NotificationService notifications;
    private final WebSocketBroadcast ws;
    private final SafeRideRepository safeRideRepo;
    private final AIService ai;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String CONTACTS_KEY_PREFIX = "contacts:user:";
    private static final long CONTACTS_TTL_HOURS = 24;

    @SuppressWarnings("unchecked")
    private List<EmergencyContact> getCachedContacts(UUID userId) {
        String key = CONTACTS_KEY_PREFIX + userId;
        try {
            Object cached = redisTemplate.opsForValue().get(key);
            if (cached != null && cached instanceof List) {
                List<Map<String, Object>> mapList = (List<Map<String, Object>>) cached;
                List<EmergencyContact> result = new ArrayList<>();
                for (Map<String, Object> m : mapList) {
                    EmergencyContact ec = new EmergencyContact();
                    if (m.get("id") != null) ec.setId(UUID.fromString((String) m.get("id")));
                    ec.setName((String) m.get("name"));
                    ec.setPhone((String) m.get("phone"));
                    ec.setRelation((String) m.get("relation"));
                    if (m.get("email") != null) ec.setEmail((String) m.get("email"));
                    result.add(ec);
                }
                log.info("Cache HIT for contacts of user {}", userId);
                return result;
            }
        } catch (Exception e) {
            log.warn("Redis read failed for contacts cache. Error: {}", e.getMessage());
        }

        // Cache MISS -> Read from MySQL
        log.info("Cache MISS for contacts of user {}. Reading from DB...", userId);
        List<EmergencyContact> dbContacts = contacts.findByUserIdOrderByPriorityAsc(userId);
        
        // Repopulate Redis
        try {
            List<Map<String, Object>> toCache = new ArrayList<>();
            for (EmergencyContact ec : dbContacts) {
                Map<String, Object> m = new HashMap<>();
                if (ec.getId() != null) m.put("id", ec.getId().toString());
                m.put("name", ec.getName());
                m.put("phone", ec.getPhone());
                m.put("relation", ec.getRelation());
                if (ec.getEmail() != null) m.put("email", ec.getEmail());
                toCache.add(m);
            }
            redisTemplate.opsForValue().set(key, toCache, java.time.Duration.ofHours(CONTACTS_TTL_HOURS));
        } catch (Exception e) {
            log.warn("Redis write failed for contacts cache. Error: {}", e.getMessage());
        }
        
        return dbContacts;
    }

    private void invalidateContactsCache(UUID userId) {
        try {
            redisTemplate.delete(CONTACTS_KEY_PREFIX + userId);
            log.info("Invalidated contacts cache for user {}", userId);
        } catch (Exception e) {
            log.warn("Redis delete failed for contacts cache. Error: {}", e.getMessage());
        }
    }

    /**
     * Trigger a new SOS. Pipeline:
     * 1) Persist alert 2) Call AI to score risk 3) Notify guardians via Twilio
     * 4) Broadcast to admin WS 5) Kick off async escalation.
     */
    @Transactional
    public SOSAlertResponse trigger(UUID userId, SOSRequest r) {
        User u = users.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));

        // 1. AI risk score
        var aiScore = ai.computeRisk(userId, r.latitude(), r.longitude());

        SOSAlert alert = SOSAlert.builder()
            .user(u)
            .triggerType(r.triggerType())
            .riskLevel(aiScore.level())
            .confidence(aiScore.confidence())
            .latitude(r.latitude())
            .longitude(r.longitude())
            .areaName(r.areaName())
            .batteryPct(r.batteryPct())
            .speedMps(r.speedMps())
            .heartRate(r.heartRate())
            .status(SOSAlert.Status.ACTIVE)
            .build();
        alerts.save(alert);

        // 2. Record location
        locations.save(LiveLocation.builder()
            .user(u)
            .latitude(r.latitude()).longitude(r.longitude())
            .speed(r.speedMps()).batteryPct(r.batteryPct())
            .build());

        // 3. Persist threat score
        scores.save(ThreatScore.builder()
            .user(u)
            .score(aiScore.score())
            .confidence(aiScore.confidence())
            .riskLevel(aiScore.level())
            .factors(aiScore.factors())
            .build());
            
        // Publish threat score generated analytics event
        analyticsProducer.publishEvent("THREAT_SCORE_GENERATED", aiScore.score());

        // Invalidate threat cache so the timeline API refreshes
        try {
            redisTemplate.delete("threat:user:" + u.getId());
        } catch (Exception e) {
            log.warn("Redis delete failed for threat cache. Error: {}", e.getMessage());
        }

        // 4. Broadcast + notify
        SOSAlertResponse resp = SOSAlertResponse.from(alert);
        ws.broadcastNewSOS(resp);

        // 5. Async: SMS/WhatsApp + voice calls to guardians
        notifyGuardiansAsync(alert, u);

        // Publish SOS created analytics event
        analyticsProducer.publishEvent("SOS_CREATED", alert.getId().toString());

        log.info("SOS triggered: alert={} user={} level={}", alert.getId(), u.getEmail(), alert.getRiskLevel());
        return resp;
    }

    public void notifyGuardiansAsync(SOSAlert alert, User u) {
        try {
            List<EmergencyContact> ecs = getCachedContacts(u.getId());
            
            // Build the list of target phone numbers to alert
            List<String> targetPhones = new ArrayList<>();
            for (EmergencyContact ec : ecs) {
                if (ec.getPhone() != null && !ec.getPhone().trim().isEmpty()) {
                    targetPhones.add(ec.getPhone().trim());
                }
            }
            
            // Fallback: If no guardians, notify the user's own registered phone!
            if (targetPhones.isEmpty() && u.getPhone() != null && !u.getPhone().trim().isEmpty()) {
                log.info("No guardians configured. Falling back to notifying user's own phone: {}", u.getPhone());
                targetPhones.add(u.getPhone().trim());
            }
            
            // Check for active safe ride
            Optional<SafeRideSession> activeRide = safeRideRepo.findTopByUserIdAndStatusOrderByCreatedAtDesc(u.getId(), SafeRideSession.RideStatus.ACTIVE);
            
            String mapsLink = String.format(
                "https://www.google.com/maps?q=%f,%f", alert.getLatitude(), alert.getLongitude());
            
            String rideInfo = "";
            if (activeRide.isPresent()) {
                SafeRideSession ride = activeRide.get();
                rideInfo = String.format(" [VEHICLE: %s, DRIVER: %s (%s)]", 
                    ride.getVehicleNumber(), 
                    ride.getDriverName() != null ? ride.getDriverName() : "Unknown", 
                    ride.getDriverMobile());
                
                // Update ride status to SOS
                ride.setStatus(SafeRideSession.RideStatus.SOS);
                safeRideRepo.save(ride);
            }

            String msg = String.format(
                "🚨 EMERGENCY: %s has triggered SOS at %s.%s Level: %s. Live: %s",
                u.getFullName(),
                alert.getAreaName() == null ? "unknown" : alert.getAreaName(),
                rideInfo,
                alert.getRiskLevel(), mapsLink);
                
            for (String phone : targetPhones) {
                // 1. Send SMS via Kafka
                notificationProducer.sendNotificationEvent(phone, msg, "SMS");
                
                // 2. Send WhatsApp via Kafka
                notificationProducer.sendNotificationEvent(phone, msg, "WHATSAPP");
                
                // 3. Place Voice Call via Kafka
                String twimlMarkup = generateTwiML(alert.getId());
                notificationProducer.sendNotificationEvent(phone, twimlMarkup, "VOICE");
            }
            // push in-app notification to user
            notifications.push(u.getId(), "SOS activated", "Guardians have been alerted. Help is on the way.", "CRITICAL");
        } catch (Exception ex) {
            log.error("notifyGuardiansAsync failed", ex);
        }
    }

    @Transactional
    public SOSAlertResponse resolve(UUID alertId, UUID resolvedBy) {
        SOSAlert a = alerts.findById(alertId).orElseThrow(() -> new NotFoundException("Alert not found"));
        a.setStatus(SOSAlert.Status.RESOLVED);
        a.setResolvedAt(Instant.now());
        if (resolvedBy != null) {
            a.setResolvedBy(users.findById(resolvedBy).orElse(null));
        }
        alerts.save(a);
        ws.broadcastResolved(a.getId());
        
        // Publish SOS resolved analytics event
        analyticsProducer.publishEvent("SOS_RESOLVED", a.getId().toString());
        
        return SOSAlertResponse.from(a);
    }

    public List<SOSAlertResponse> activeAlerts() {
        return alerts.findActive(List.of(SOSAlert.Status.ACTIVE, SOSAlert.Status.ESCALATED))
            .stream().map(SOSAlertResponse::from).toList();
    }

    public void updateLocation(UUID userId, LocationUpdateRequest r) {
        User u = users.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));
        LiveLocation savedLoc = locations.save(LiveLocation.builder()
            .user(u)
            .latitude(r.latitude()).longitude(r.longitude())
            .accuracy(r.accuracy()).speed(r.speed()).heading(r.heading())
            .batteryPct(r.batteryPct())
            .build());
            
        // Update Redis GPS Cache with Option A Write-Through Strategy
        try {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("lat", savedLoc.getLatitude());
            map.put("lng", savedLoc.getLongitude());
            if (savedLoc.getSpeed() != null) map.put("speed", savedLoc.getSpeed());
            if (savedLoc.getBatteryPct() != null) map.put("battery", savedLoc.getBatteryPct());
            if (savedLoc.getRecordedAt() != null) map.put("ts", savedLoc.getRecordedAt().toEpochMilli());
            redisTemplate.opsForValue().set("location:latest:user:" + userId, map, java.time.Duration.ofSeconds(1800));
        } catch (Exception e) {
            log.warn("Redis write failed for GPS cache update: {}", e.getMessage());
        }

        ws.broadcastLocation(userId, r);
    }

    public List<EmergencyContact> getContacts(UUID userId) {
        return getCachedContacts(userId);
    }

    @Transactional
    public EmergencyContact addContact(UUID userId, com.aegis.dto.request.EmergencyContactRequest r) {
        User u = users.findById(userId).orElseThrow();
        EmergencyContact c = EmergencyContact.builder()
            .user(u)
            .name(r.name())
            .relation(r.relation())
            .phone(r.phone())
            .email(r.email())
            .priority(r.priority() != null ? r.priority() : 1)
            .build();
        EmergencyContact saved = contacts.save(c);
        invalidateContactsCache(userId);
        return saved;
    }

    @Transactional
    public void deleteContact(UUID userId, UUID contactId) {
        EmergencyContact c = contacts.findById(contactId).orElseThrow();
        if (!c.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized");
        }
        contacts.delete(c);
        invalidateContactsCache(userId);
    }

    public String generateTwiML(UUID alertId) {
        SOSAlert a = alerts.findById(alertId).orElse(null);
        String name = "Someone";
        String trigger = "Manual Press";
        String area = "unknown area";
        if (a != null) {
            name = a.getUser().getFullName();
            trigger = a.getTriggerType().toString().replace("_", " ");
            area = a.getAreaName() != null ? a.getAreaName() : "unknown area";
        }
        
        return String.format(
            "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
            "<Response>\n" +
            "    <Pause length=\"1\"/>\n" +
            "    <Say voice=\"alice\" language=\"en-US\">" +
            "Emergency Alert. This is an automated security broadcast from Aegis Platform. " +
            "Your contact, %s, has triggered a critical %s safety alert at %s. " +
            "I repeat, %s has activated their emergency safety signal. " +
            "Please check your messages immediately for their live location and coordinates to assist them. " +
            "We have also notified the police and emergency dispatch. " +
            "Thank you." +
            "</Say>\n" +
            "    <Pause length=\"1\"/>\n" +
            "    <Say voice=\"alice\" language=\"en-US\">Emergency, check your messages now.</Say>\n" +
            "</Response>",
            name, trigger, area, name
        );
    }
}
