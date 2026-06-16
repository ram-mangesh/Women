package com.aegis.config;

/**
 * Kafka topic constants for AEGIS event-driven architecture.
 * 
 * Centralized topic definitions to ensure consistency across
 * producers and consumers.
 * 
 * Topic Naming Convention: aegis.{domain}.{event}
 * 
 * @author AEGIS Team
 * @version 1.0
 */
public final class KafkaTopics {

    private KafkaTopics() {
        // Utility class
    }

    // ─────────────────────────────────────────────
    // SOS Events
    // ─────────────────────────────────────────────

    /**
     * SOS event topic - Published when a user triggers an SOS.
     * Contains: SOS event data with user ID, location, severity.
     */
    public static final String SOS_EVENT = "aegis.sos.triggered";

    /**
     * SOS resolved topic - Published when an SOS is resolved.
     * Contains: SOS ID, resolution timestamp, resolution type.
     */
    public static final String SOS_RESOLVED = "aegis.sos.resolved";

    /**
     * SOS escalated topic - Published when an SOS is escalated.
     * Contains: SOS ID, escalation reason, new severity level.
     */
    public static final String SOS_ESCALATED = "aegis.sos.escalated";

    // ─────────────────────────────────────────────
    // Voice SOS Events
    // ─────────────────────────────────────────────

    /**
     * Voice SOS secret detected topic - Published when voice AI detects SOS
     * keywords.
     * Contains: User ID, audio metadata, confidence score, detected phrase.
     */
    public static final String VOICE_SOS_DETECTED = "aegis.voice.sos.detected";

    /**
     * Voice SOS confirmed topic - Published when voice SOS is confirmed.
     * Contains: User ID, location, audio transcript, confidence score.
     */
    public static final String VOICE_SOS_CONFIRMED = "aegis.voice.sos.confirmed";

    // ─────────────────────────────────────────────
    // Journey Events
    // ─────────────────────────────────────────────

    /**
     * Journey started topic - Published when a safe ride journey begins.
     * Contains: Journey ID, user ID, companion ID, route info.
     */
    public static final String JOURNEY_STARTED = "aegis.journey.started";

    /**
     * Journey in-progress topic - Published periodically during journey.
     * Contains: Journey ID, current location, speed, ETA.
     */
    public static final String JOURNEY_IN_PROGRESS = "aegis.journey.in-progress";

    /**
     * Journey completed topic - Published when a journey ends normally.
     * Contains: Journey ID, start time, end time, duration, distance.
     */
    public static final String JOURNEY_COMPLETED = "aegis.journey.completed";

    /**
     * Journey cancelled topic - Published when a journey is cancelled.
     * Contains: Journey ID, cancellation reason, cancellation timestamp.
     */
    public static final String JOURNEY_CANCELLED = "aegis.journey.cancelled";

    public static final String JOURNEY_EVENTS_TOPIC = "aegis.journey.events";
    
    public static final String JOURNEY_EVENTS_DLQ_TOPIC = "aegis.journey.events.DLQ";

    // ─────────────────────────────────────────────
    // Route Deviation Events
    // ─────────────────────────────────────────────

    /**
     * Route deviation detected topic - Published when journey deviates from planned
     * route.
     * Contains: Journey ID, deviation distance, current location, deviation reason.
     */
    public static final String ROUTE_DEVIATION = "aegis.journey.route-deviation";

    /**
     * Route deviation resolved topic - Published when journey returns to planned
     * route.
     * Contains: Journey ID, max deviation distance, resolution timestamp.
     */
    public static final String ROUTE_DEVIATION_RESOLVED = "aegis.journey.route-deviation-resolved";

    // ─────────────────────────────────────────────
    // Emergency Escalation Events
    // ─────────────────────────────────────────────

    /**
     * Emergency alert topic - Published when emergency level increases.
     * Contains: SOS ID, new emergency level, reason, affected parties.
     */
    public static final String EMERGENCY_ALERT = "aegis.emergency.alert";

    /**
     * Emergency resolved topic - Published when emergency is resolved.
     * Contains: SOS ID, resolution type, response summary.
     */
    public static final String EMERGENCY_RESOLVED = "aegis.emergency.resolved";

    // ─────────────────────────────────────────────
    // Notification Events
    // ─────────────────────────────────────────────

    /**
     * Notification dispatch topic - Published when notifications need to be sent.
     * Contains: Notification type, recipients, message, priority.
     */
    public static final String NOTIFICATION_DISPATCH = "aegis.notification.dispatch";

    /**
     * Notification sent topic - Published when notification is successfully sent.
     * Contains: Notification ID, recipient count, delivery status.
     */
    public static final String NOTIFICATION_SENT = "aegis.notification.sent";

    /**
     * Notification failed topic - Published when notification delivery fails.
     * Contains: Notification ID, failed recipients, error reason.
     */
    public static final String NOTIFICATION_FAILED = "aegis.notification.failed";

    // ─────────────────────────────────────────────
    // Analytics Events
    // ─────────────────────────────────────────────

    /**
     * SOS analytics topic - Published for SOS event analytics.
     * Contains: SOS metrics, response times, resolution data.
     */
    public static final String SOS_ANALYTICS = "aegis.analytics.sos";

    /**
     * Journey analytics topic - Published for journey metrics.
     * Contains: Journey metrics, completion rates, safety scores.
     */
    public static final String JOURNEY_ANALYTICS = "aegis.analytics.journey";

    /**
     * Dashboard metrics topic - Published for real-time dashboard updates.
     * Contains: Dashboard metrics, active users, pending alerts.
     */
    public static final String DASHBOARD_METRICS = "aegis.analytics.dashboard";

    // ─────────────────────────────────────────────
    // Threat Analysis Events
    // ─────────────────────────────────────────────

    /**
     * Threat score updated topic - Published when threat score changes.
     * Contains: User ID, new threat score, risk factors, recommendation.
     */
    public static final String THREAT_SCORE_UPDATED = "aegis.threat.score-updated";

    /**
     * High risk alert topic - Published when threat score exceeds threshold.
     * Contains: User ID, threat score, risk level, recommended actions.
     */
    public static final String HIGH_RISK_ALERT = "aegis.threat.high-risk";

    // Legacy/Integration test support topics
    public static final String NOTIFICATIONS_SMS_TOPIC = "aegis.notification.sms";
    public static final String ANALYTICS_EVENTS_TOPIC = "aegis.analytics.events";
}