# AEGIS Women Safety Platform — Redis & Kafka Integration Architecture Review

## Document Control
- **Version**: 1.0
- **Date**: 2026-01-11
- **Author**: Senior Software Architect Review
- **Status**: REVIEW — Pre-Implementation Analysis

---

# EXECUTIVE SUMMARY

This document provides a comprehensive architectural analysis of the AEGIS Women Safety Platform and evaluates the precise fit for Redis (caching/session layer) and Kafka (event streaming layer). The platform is a **modular monolith** built with Spring Boot 3.2.0, serving women's safety through 17 integrated modules.

**Key Finding**: Redis and Kafka should be adopted **selectively**, not universally. The recommended approach adds complexity to only 6-8 specific use cases out of 17 modules, preserving the hackathon-demo-friendly architecture while enabling future microservice migration.

---

# PHASE 1: EXISTING SYSTEM ANALYSIS

## 1.1 Current Architecture Style

**Classification: Modular Monolith (Single JAR)**

The AEGIS platform follows a modular monolith pattern within a single Spring Boot JAR:
- Single deployment artifact (`aegis-api.jar`)
- Modular package structure (17+ domain packages)
- Shared PostgreSQL database
- In-process communication between modules
- WebSocket for real-time client push

**Architecture Diagram:**
```
┌─────────────────────────────────────────────────────────────┐
│                     AEGIS Architecture                       │
│                                                              │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐    │
│  │   React Web  │   │  Mobile App  │   │  Wearables   │    │
│  │   (Frontend) │   │   (React     │   │   IoT        │    │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘    │
│         │                  │                   │             │
│         └──────────────────┼───────────────────┘             │
│                            │ WebSocket / HTTP                 │
│                  ┌─────────▼─────────┐                       │
│                  │   Nginx Reverse   │                       │
│                  │      Proxy        │                       │
│                  └─────────┬─────────┘                       │
│                            │                                  │
│                  ┌─────────▼─────────┐                       │
│                  │   Spring Boot     │                       │
│                  │   Monolith JAR    │                       │
│                  │                   │                       │
│          ┌───────┤ Modules: 17+      │                       │
│          │       │ • Auth            │                       │
│          │       │ • SOS             │                       │
│          │       │ • SafeRide        │                       │
│          │       │ • Guardian        │                       │
│          │       │ • Voice SOS       │                       │
│          │       │ • AI              │                       │
│          │       │ • Blockchain      │                       │
│          │       │ • Legal           │                       │
│          │       │ • More...         │                       │
│          │       └───────────────────┘                       │
│          │                            │                       │
│          │     ┌──────────────────────┘                       │
│          │     │                                               │
│  ┌────────▼─────▼────────┐                                    │
│  │    PostgreSQL         │                                    │
│  │    (Shared DB)        │                                    │
│  │    • Users            │                                    │
│  │    • SOS Records      │                                    │
│  │    • Journeys         │                                    │
│  │    • Evidence         │                                    │
│  │    • More...          │                                    │
│  └───────────────────────┘                                    │
│                                                              │
│  External Services:                                          │
│  • Twilio (Calls/SMS/WhatsApp)                               │
│  • Google Maps API                                           │
│  • AI Microservice (Python)                                 │
│  • Blockchain (Ethereum/Polygon)                             │
└─────────────────────────────────────────────────────────────┘
```

## 1.2 Module Inventory & Analysis

### Module 1: Authentication Module
**Package**: `com.aegis.controller.auth` / `com.aegis.service.AuthService`

**Purpose**: User registration, login, JWT token management, OTP verification, password reset, refresh token rotation

**Dependencies**:
- Database: `User`, `UserSecurity` entities
- External: Email/SMS service for OTP
- WebSocket: Session broadcast

**Database Interactions**:
- `users` table — user profile data
- `user_security` table — security settings, guardian links
- `refresh_tokens` table — JWT refresh tokens
- `login_attempts` table — brute force protection

**Real-time Communication**: None (stateless auth)

**External Integrations**: Email/SMS for OTP delivery

**Critical Path**: YES — High priority, frequently called

---

### Module 2: SOS Module
**Package**: `com.aegis.controller.SOSController` / `com.aegis.service.SOSService`

**Purpose**: Emergency SOS trigger, location tracking, guardian notification, police dispatch, Twilio call integration, escalation workflow

**Dependencies**:
- Database: `sos_alerts`, `sos_locations`
- WebSocket: Real-time SOS broadcast
- Twilio: Emergency calls
- AI: Threat analysis
- External: Google Maps for geocoding

**Database Interactions**:
- `sos_alerts` — emergency records with status
- `sos_locations` — timestamped location points

**Real-time Communication**: WebSocket broadcast to guardians, police notifications

**External Integrations**: Twilio (calls/SMS/WhatsApp), Google Maps

**Critical Path**: YES — Mission-critical, sub-second latency required

---

### Module 3: Safe Ride Module
**Package**: `com.aegis.controller.SafeRideController` / `com.aegis.service.SafeRideService`

**Purpose**: Journey verification, real-time tracking, ETA monitoring, automated check-ins, route deviation detection, auto-escalation

**Dependencies**:
- Database: `journeys`, `journey_checkins`, `journey_events`
- WebSocket: Live journey status
- SOS: Escalation to SOS module
- AI: Route deviation analysis

**Database Interactions**:
- `journeys` — ride records with status
- `journey_checkins` — user check-in timestamps
- `journey_events` — deviation/safety events

**Real-time Communication**: WebSocket for journey status updates

**External Integrations**: Google Maps for route calculation

**Critical Path**: YES — Safety-critical during active journeys

---

### Module 4: Guardian Module
**Package**: `com.aegis.controller.GuardianController` / `com.aegis.service.GuardianService`

**Purpose**: Guardian management (add/remove/verify), emergency contact linking, notification routing, guardian alert system

**Dependencies**:
- Database: `users`, `guardian_links`
- WebSocket: Guardian alert broadcast
- SMS/Email: Guardian notifications

**Database Interactions**:
- `users` — guardian user records
- `guardian_links` — user-guardian relationships

**Real-time Communication**: WebSocket for guardian alerts

**External Integrations**: SMS/Email for guardian notifications

**Critical Path**: YES — Guardians are first responders

---

### Module 5: Voice SOS Module
**Package**: `com.aegis.controller.VoiceSOSController` / `com.aegis.service.VoiceSOSService`

**Purpose**: Secret voice activation ("Hey Aegis"), voice-to-text transcription, threat analysis, covert emergency trigger

**Dependencies**:
- Database: `voice_sos_records`
- AI: Speech-to-text, threat analysis
- SOS: Escalation to SOS module
- WebSocket: Voice SOS alert broadcast

**Database Interactions**:
- `voice_sos_records` — voice activation logs

**Real-time Communication**: WebSocket for voice SOS alerts

**External Integrations**: AI microservice for transcription

**Critical Path**: YES — Covert emergency trigger

---

### Module 6: AI Threat Analysis Module
**Package**: `com.aegis.service.AIService` / `ai-services/`

**Purpose**: Threat scoring, risk assessment, anomaly detection, pattern recognition, ML-powered safety predictions

**Dependencies**:
- External: Python AI microservice (FastAPI)
- Database: `threat_scores`, `risk_analyses`
- WebSocket: Threat score updates

**Database Interactions**:
- `threat_scores` — historical threat scores
- `risk_analyses` — detailed risk assessment records

**Real-time Communication**: WebSocket for live threat updates

**External Integrations**: Python AI service (local or containerized)

**Critical Path**: NO — Supporting module, can have slight latency

---

### Module 7: Notification Module
**Package**: `com.aegis.service.NotificationService` / `com.aegis.service.TwilioService`

**Purpose**: Multi-channel notifications (SMS, WhatsApp, Push, Email), notification queuing, delivery status tracking, retry logic

**Dependencies**:
- Database: `notifications`, `notification_delivery`
- Twilio: SMS/WhatsApp/SMS delivery
- WebSocket: In-app notifications

**Database Interactions**:
- `notifications` — notification records
- `notification_delivery` — delivery status tracking

**Real-time Communication**: WebSocket for in-app notifications

**External Integrations**: Twilio (SMS/WhatsApp), Push notification service

**Critical Path**: YES — Emergency notifications are time-sensitive

---

### Module 8: Live Tracking Module
**Package**: `com.aegis.controller.TrackingController` / `com.aegis.service.LocationService`

**Purpose**: Real-time GPS location tracking, location history, geofencing, live map updates, location caching

**Database Interactions**:
- `locations` — GPS coordinate records
- `geofences` — defined safe/unsafe zones

**Real-time Communication**: WebSocket for live location updates

**External Integrations**: Google Maps for reverse geocoding

**Critical Path**: YES — Real-time tracking required for safety

---

### Module 9: Dashboard Module
**Package**: `com.aegis.controller.DashboardController`

**Purpose**: Admin dashboard metrics, safety analytics, user statistics, incident reports, real-time counters

**Dependencies**:
- Database: Aggregated queries across all modules
- Cache: Dashboard metrics (candidate for Redis)

**Database Interactions**:
- Complex JOIN queries across multiple tables
- Aggregation queries for statistics

**Real-time Communication**: WebSocket for dashboard updates

**External Integrations**: None

**Critical Path**: NO — Analytics can use cached data

---

### Module 10: Evidence Vault Module
**Package**: `com.aegis.controller.EvidenceController` / `com.aegis.service.BlockchainService`

**Purpose**: Evidence collection, blockchain anchoring, tamper-proof storage, chain of custody, legal documentation

**Dependencies**:
- Database: `evidence_records`, `evidence_blocks`
- Blockchain: Ethereum/Polygon transaction anchoring
- SOS: Evidence linkage to incidents

**Database Interactions**:
- `evidence_records` — evidence metadata
- `evidence_blocks` — blockchain anchor records

**Real-time Communication**: None

**External Integrations**: Blockchain network (Ethereum/Polygon testnet)

**Critical Path**: NO — Legal evidence, async processing acceptable

---

### Module 11: Legal Assistance Module
**Package**: `com.aegis.controller.LegalController`

**Purpose**: Legal resource directory, FIR assistance, legal aid matching, case tracking, rights information

**Dependencies**:
- Database: `legal_resources`, `legal_cases`

**Database Interactions**:
- Read-heavy, low write frequency

**Real-time Communication**: None

**External Integrations**: None

**Critical Path**: NO — Informational module

---

### Module 12: Walk Companion Module
**Package**: `com.aegis.controller.WalkController`

**Purpose**: Live walk tracking, ETA notifications, check-in reminders, walk completion confirmation, auto-escalation on missed check-in

**Dependencies**:
- Database: `walk_sessions`, `walk_checkins`
- WebSocket: Walk status updates
- Notification: Guardian alerts

**Database Interactions**:
- `walk_sessions` — active walk records
- `walk_checkins` — periodic check-in records

**Real-time Communication**: WebSocket for walk status

**External Integrations**: None

**Critical Path**: YES — Active walk safety-critical

---

### Module 13: Mesh Network Module
**Package**: `com.aegis.controller.MeshController`

**Purpose**: Offline mesh communication, Bluetooth messaging, SMS fallback, peer-to-peer safety alerts

**Dependencies**:
- Database: `mesh_messages`
- Mobile: Bluetooth/BLE hardware access

**Database Interactions**:
- `mesh_messages` — mesh network message queue

**Real-time Communication**: Mesh (offline), WebSocket when online

**External Integrations**: Mobile hardware (Bluetooth)

**Critical Path**: NO — Fallback communication

---

### Module 14: Community Reports Module
**Package**: `com.aegis.controller.ReportController`

**Purpose**: Incident reporting, hot spot mapping, community safety ratings, report verification, trend analysis

**Dependencies**:
- Database: `incident_reports`, `hotspot_data`

**Database Interactions**:
- Write-heavy (report creation)
- Read-heavy (report viewing)

**Real-time Communication**: None

**External Integrations**: Google Maps for hotspot visualization

**Critical Path**: NO — Community feature

---

### Module 15: Safety Pod Module
**Package**: `com.aegis.controller.SafetyPodController` / `com.aegis.service.SafetyPodService`

**Purpose**: Physical device management, IoT pairing, device health monitoring, firmware updates, device location tracking

**Dependencies**:
- Database: `safety_pods`, `pod_events`
- WebSocket: Device status updates

**Database Interactions**:
- `safety_pods` — device registry
- `pod_events` — device event logs

**Real-time Communication**: WebSocket for device status

**External Integrations**: IoT device cloud

**Critical Path**: NO — Hardware accessory

---

### Module 16: Wearables Module
**Package**: `com.aegis.controller.WearableController`

**Purpose**: Smartwatch integration, biometric monitoring (heart rate, fall detection), wearable SOS trigger, health data analytics

**Dependencies**:
- Database: `wearable_data`, `biometric_readings`
- SOS: Biometric-triggered SOS

**Database Interactions**:
- `wearable_data` — wearable device records
- `biometric_readings` — time-series health data

**Real-time Communication**: WebSocket for live biometric alerts

**External Integrations**: Smartwatch APIs (Apple Watch, Wear OS)

**Critical Path**: YES — Biometric SOS is safety-critical

---

### Module 17: Stalker Zone Module
**Package**: `com.aegis.controller.StalkerController`

**Purpose**: Unwanted attention detection, pattern logging, frequency heatmaps, AI-powered escalation, location-based alerts

**Dependencies**:
- Database: `stalker_zones`, `stalker_events`
- AI: Pattern analysis
- Location: Historical location data

**Database Interactions**:
- `stalker_zones` — zone definitions
- `stalker_events` — incident logs

**Real-time Communication**: WebSocket for stalker alerts

**External Integrations**: Google Maps for heatmap

**Critical Path**: NO — Pattern detection, async acceptable

---

## 1.3 Dependency Graph

```
Authentication ──────► All Modules
SOS ──────────────────► SafeRide, Guardian, Voice SOS, Notifications
SafeRide ─────────────► SOS (escalation), Guardian (notifications)
Guardian ─────────────► Notifications, WebSocket
Voice SOS ────────────► SOS, AI
AI ───────────────────► SOS, SafeRide, Walk, Stalker
Notifications ────────► All Modules (outbound)
Live Tracking ────────► SOS, SafeRide, Walk, Dashboard
Dashboard ────────────► All Modules (read-only aggregation)
```

---

# PHASE 2: CURRENT WORKFLOW MAPPING

## 2.1 Workflow 1: User Registration

### Flow Diagram
```
User → React Frontend → POST /api/auth/register → AuthController
  → AuthService.register()
    → Validate email/phone
    → Generate OTP
    → Send OTP via Email/SMS (Twilio)
    → Store OTP in database (login_attempts table)
    → User verifies OTP
    → Create user record
    → Create security settings
    → Generate JWT tokens
    → Return access_token + refresh_token
```

### Current Bottlenecks
- **OTP Storage**: OTP stored in MySQL, requires DB query for every verification
- **No session cache**: Each registration creates new DB record
- **Email/SMS latency**: External service call blocks request (acceptable)

### Synchronous Operations
- Email/SMS OTP delivery (external call)
- Database write for user creation

### Performance Issues
- None significant at current scale

### Scaling Limitations
- OTP verification requires MySQL lookup
- No rate limiting cache (login_attempts table used but slow at scale)

---

## 2.2 Workflow 2: Login Authentication

### Flow Diagram
```
User → POST /api/auth/login → AuthController
  → AuthService.login()
    → Validate credentials
    → Check brute force (login_attempts table)
    → Generate JWT access + refresh tokens
    → Store refresh token (refresh_tokens table)
    → Return tokens
  →