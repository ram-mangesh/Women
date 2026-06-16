# 🛡️ AEGIS — Complete A-to-Z Testing & Workflow Documentation

> **Last Updated:** 2026
> **Version:** 1.0
> **Status:** Production-Ready Testing Guide

---

## 📋 Table of Contents

1. [System Architecture Overview](#-system-architecture-overview)
2. [Tech Stack Summary](#-tech-stack-summary)
3. [Connection Map (How Everything Connects)](#-connection-map)
4. [Pre-Testing Setup Checklist](#-pre-testing-setup-checklist)
5. [Environment Variables](#-environment-variables)
6. [Running the Full Stack](#-running-the-full-stack)
7. [Core Features Testing (11 Features)](#-core-features-testing)
8. [AI Features Testing (12 Features)](#-ai-features-testing)
9. [Mobile App Testing](#-mobile-app-testing)
10. [Backend API Testing](#-backend-api-testing)
11. [Python ML Services Testing](#-python-ml-services-testing)
12. [Database Verification](#-database-verification)
13. [WebSocket Real-Time Testing](#-websocket-real-time-testing)
14. [Integration Testing](#-integration-testing)
15. [Edge Cases & Error Handling](#-edge-cases--error-handling)
16. [Performance Testing](#-performance-testing)
17. [Security Testing](#-security-testing)
18. [Final Submission Checklist](#-final-submission-checklist)
19. [Troubleshooting Guide](#-troubleshooting-guide)

---

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER LAYER                                   │
├──────────────────────────────┬──────────────────────────────────────┤
│   Web App (React + Vite)    │   Mobile App (React Native + Expo)   │
│   http://localhost:5173     │   http://localhost:8081              │
└──────────────┬───────────────┴──────────────┬───────────────────────┘
               │                               │
               │   HTTP/REST + WebSocket        │
               │   JWT Bearer Tokens            │
               ▼                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                               │
├──────────────────────────────┬──────────────────────────────────────┤
│   Spring Boot (Java 17)     │   FastAPI (Python 3.11)              │
│   http://localhost:8080     │   http://localhost:8000              │
│   - Auth, SOS, Incidents    │   - ML Models, AI Services           │
│   - WebSocket (STOMP)       │   - 18 Endpoints                     │
│   - Twilio Integration      │   - 9 ML Services                    │
└──────────────┬───────────────┴──────────────┬───────────────────────┘
               │                               │
               ▼                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                     │
├──────────────────────────────┬──────────────────────────────────────┤
│   PostgreSQL (v16)          │   Redis (Cache + Sessions)           │
│   Port: 5432                │   Port: 6379                         │
│   - 11 Tables               │   - JWT blacklist                    │
│   - Flyway migrations       │   - Rate limiting                    │
└──────────────────────────────┴──────────────────────────────────────┘
```

---

## 🛠️ Tech Stack Summary

### Frontend (Web)
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.x | UI Framework |
| Vite | 7.x | Build Tool |
| TypeScript | 5.x | Type Safety |
| Tailwind CSS | 4.x | Styling |
| Framer Motion | 11.x | Animations |
| Recharts | 2.x | Data Visualization |
| Leaflet | 1.9.x | Maps |
| React Router | 6.x | Navigation |
| Zustand | 4.x | State Management |
| Axios | 1.x | HTTP Client |
| Socket.io | 4.x | WebSocket |

### Frontend (Mobile)
| Technology | Version | Purpose |
|-----------|---------|---------|
| React Native | 0.74.x | Mobile Framework |
| Expo | 51.x | Dev Platform |
| React Navigation | 6.x | Navigation |
| Expo Haptics | 13.x | Vibration |
| Expo Location | 17.x | GPS |
| Expo Camera | 15.x | Camera |
| Expo AV | 14.x | Audio/Video |
| Expo Sensors | 13.x | Accelerometer |

### Backend (Java)
| Technology | Version | Purpose |
|-----------|---------|---------|
| Spring Boot | 3.2.x | Framework |
| Spring Security | 6.x | Authentication |
| Spring Data JPA | 3.2.x | ORM |
| PostgreSQL | 16.x | Database |
| Flyway | 9.x | Migrations |
| JWT (jjwt) | 0.12.x | Tokens |
| Twilio SDK | 10.x | SMS/Calls |
| WebSocket (STOMP) | 6.x | Real-time |

### AI Services (Python)
| Technology | Version | Purpose |
|-----------|---------|---------|
| FastAPI | 0.111.x | API Framework |
| scikit-learn | 1.5.x | ML Models |
| transformers | 4.41.x | NLP Models |
| numpy | 1.26.x | Numerical Computing |
| PyTorch | 2.3.x | Deep Learning |
| librosa | 0.10.x | Audio Processing |
| Pillow | 10.x | Image Processing |
| ultralytics | 8.x | YOLO Object Detection |

---

## 🔗 Connection Map

### Request Flow: User Action → Backend → ML → DB → Response

```
User clicks "Generate FIR" on Legal Aid page
    │
    ▼
[Frontend React] POST /ai/legal/fir
    │  Headers: Authorization: Bearer <JWT>
    │  Body: { incident details }
    ▼
[FastAPI Python] /ai/legal/fir endpoint
    │
    ├─► [ML: LLM Engine] Generates FIR draft
    │     - Analyzes incident type
    │     - Matches IPC sections
    │     - Includes evidence from blockchain
    │
    ├─► [PostgreSQL] Fetch user profile + past incidents
    │
    └─► Returns: { fir_draft, ipc_sections, lawyers }
         │
         ▼
[Frontend React] Displays FIR draft + matched lawyers
```

### Data Flow: Feature-Wise Connection

| Feature | Frontend | Backend | Python ML | Database |
|---------|----------|---------|-----------|----------|
| **Auth** | `/login`, `/register` | Spring Boot `/api/v1/auth/*` | — | `users`, `emergency_contacts` |
| **SOS** | `/app/sos` | Spring Boot `/api/v1/sos/*` | `/ai/risk` | `sos_alerts`, `threat_scores` |
| **Deepfake** | `/features/deepfake` | FastAPI `/ai/deepfake` | `deepfake_detector.py` | — |
| **Companion** | `/features/companion` | FastAPI `/ai/companion/*` | `companion_memory.py` | `companion_memories` |
| **Stalker** | `/features/stalker` | FastAPI `/ai/stalker/*` | `stalker_ml.py` | `stalker_logs` |
| **Mesh SOS** | `/features/mesh` | FastAPI `/ai/mesh/*` | `mesh_routing_ml.py` | `mesh_nodes` |
| **Safety Pods** | `/features/pods` | Spring Boot WebSocket | — | `safety_pods`, `pod_members` |
| **Bystander** | `/features/bystander` | FastAPI `/ai/bystander/*` | `bystander_ml.py` | `verified_helpers` |
| **Blockchain** | `/features/blockchain` | FastAPI `/ai/blockchain/*` | Hash chain logic | `evidence_chain` |
| **Biometric** | `/features/biometric` | Spring Boot `/api/v1/biometric/*` | WebAuthn API | `biometric_profiles` |
| **Wearables** | `/features/wearables` | FastAPI `/ai/gesture/*` | `gesture_ml.py` | `wearable_devices` |
| **Walk With Me** | `/features/walk` | FastAPI `/ai/walk/*` | `walk_companion_ml.py` | `walk_sessions` |
| **Trauma Care** | `/features/trauma` | FastAPI `/ai/trauma/*` | `trauma_coach.py` | `therapy_sessions` |
| **Legal Aid** | `/features/legal` | FastAPI `/ai/legal/*` | `fir_generator.py` | `legal_cases`, `fir_drafts` |

---

## ✅ Pre-Testing Setup Checklist

### Prerequisites Installed

- [ ] **Node.js** v20+ installed (`node --version`)
- [ ] **npm** v10+ installed (`npm --version`)
- [ ] **Java 17** installed (`java --version`)
- [ ] **Maven** v3.9+ installed (`mvn --version`)
- [ ] **Python 3.11** installed (`python --version`)
- [ ] **PostgreSQL 16** running (`psql --version`)
- [ ] **Redis** running (`redis-cli ping`)
- [ ] **Docker** installed (optional, for containerized run)
- [ ] **Git** installed (`git --version`)

### Tools for Testing

- [ ] **Browser**: Chrome/Firefox (latest)
- [ ] **API Client**: Postman or Thunder Client (VS Code extension)
- [ ] **WebSocket Client**: Browser DevTools Network tab
- [ ] **Database Client**: pgAdmin or DBeaver
- [ ] **Mobile Testing**: Expo Go app on phone

---

## 🔐 Environment Variables

### Root `.env` File

```bash
# Database
POSTGRES_DB=aegis
POSTGRES_USER=aegis
POSTGRES_PASSWORD=aegis_secret
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/aegis

# JWT
JWT_SECRET=aegis-super-secret-jwt-key-change-me-in-production-32chars!
JWT_ACCESS_EXPIRY_MS=900000
JWT_REFRESH_EXPIRY_MS=604800000

# Twilio (for SMS/Calls)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM_NUMBER=+15555550100

# AI Services
AI_SERVICE_URL=http://localhost:8000
OPENAI_API_KEY=sk-...
HF_TOKEN=hf_...

# Google Maps
GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### Frontend `.env.local` File

```bash
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080/ws
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

---

## 🚀 Running the Full Stack

### Step 1: Start PostgreSQL & Redis

```bash
# Using Docker (recommended)
docker run -d --name aegis-postgres \
  -e POSTGRES_DB=aegis \
  -e POSTGRES_USER=aegis \
  -e POSTGRES_PASSWORD=aegis_secret \
  -p 5432:5432 \
  postgres:16-alpine

docker run -d --name aegis-redis \
  -p 6379:6379 \
  redis:7-alpine
```

### Step 2: Start Spring Boot Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run

# Expected output:
# ✓ Started AegisApplication in X.XXX seconds
# ✓ Tomcat started on port(s): 8080
# ✓ Swagger UI: http://localhost:8080/swagger-ui.html
```

### Step 3: Start FastAPI Python Services

```bash
cd ai-services
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Expected output:
# INFO:     Uvicorn running on http://0.0.0.0:8000
# INFO:     Started reloader process
# ✓ All AI services ready (12 features + 5 ML models loaded)
```

### Step 4: Start React Frontend

```bash
# From root directory
npm install
npm run dev

# Expected output:
# VITE v7.x.x  ready in XXX ms
# ➜  Local:   http://localhost:5173/
# ➜  Network: use --host to expose
```

### Step 5: Start Mobile App (Optional)

```bash
cd mobile
npm install
npx expo start

# Expected output:
# › Metro waiting on exp://192.168.1.X:8081
# › Scan QR code with Expo Go app
```

---

## 🎯 Core Features Testing

### 1. 🏠 Landing Page

**URL:** `http://localhost:5173/`

#### Test Cases

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 1 | Page loads | Visit URL | Landing page with hero, features grid, CTA | ⬜ |
| 2 | Hero animation | Check hero section | Animated gradient text, floating cards | ⬜ |
| 3 | Features grid | Scroll down | 12 feature cards visible with icons | ⬜ |
| 4 | CTA buttons | Click "Get Started" | Redirects to `/register` | ⬜ |
| 5 | Sign In button | Click "Sign In" | Redirects to `/login` | ⬜ |
| 6 | Mobile responsive | Resize browser | Layout adapts, hamburger menu appears | ⬜ |
| 7 | Dark mode | Toggle theme (if exists) | Colors change appropriately | ⬜ |

#### Console Checks
```
Open DevTools (F12) → Console
- [ ] No errors (red text)
- [ ] No warnings (yellow text) except expected ones
- [ ] Network tab: All assets loaded (200 status)
```

---

### 2. 🔐 Login Page

**URL:** `http://localhost:5173/login`

#### Test Cases

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 1 | Form renders | Visit URL | Email + password fields, role selector, login button | ⬜ |
| 2 | Role selector | Click USER/GUARDIAN/ADMIN | Selection highlights | ⬜ |
| 3 | Valid login | Enter valid credentials | Redirect to dashboard | ⬜ |
| 4 | Invalid login | Enter wrong password | Error message shown | ⬜ |
| 5 | Empty fields | Click login without input | Validation error | ⬜ |
| 6 | Demo shortcuts | Click "Demo Login" | Auto-fills and logs in | ⬜ |
| 7 | Forgot password | Click link | Shows reset flow (if implemented) | ⬜ |

#### Backend API Calls

**Endpoint:** `POST /api/v1/auth/login`

```bash
# Test with Postman
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "aanya@aegis.ai",
    "password": "demo1234",
    "role": "USER"
  }'

# Expected Response (200 OK):
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 900000,
  "user": {
    "id": "uuid",
    "name": "Aanya Kapoor",
    "email": "aanya@aegis.ai",
    "role": "USER"
  }
}
```

#### Database Verification

```sql
-- Check user exists
SELECT id, full_name, email, role, is_active
FROM users
WHERE email = 'aanya@aegis.ai';

-- Expected: 1 row with matching details
```

---

### 3. 📝 Register Page (Multi-Step)

**URL:** `http://localhost:5173/register`

#### Test Cases — Step 1: Role Selection

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 1 | 3 role cards | Visit URL | USER, GUARDIAN, ADMIN cards visible | ⬜ |
| 2 | Select USER | Click USER card | Card highlights, next button enabled | ⬜ |
| 3 | Select GUARDIAN | Click GUARDIAN card | Card highlights, different fields in step 3 | ⬜ |
| 4 | Select ADMIN | Click ADMIN card | Card highlights, admin code field in step 3 | ⬜ |

#### Test Cases — Step 2: Basic Info

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 5 | Form fields | Proceed to step 2 | Name, email, phone, password fields | ⬜ |
| 6 | Email validation | Enter invalid email | Error: "Invalid email format" | ⬜ |
| 7 | Phone validation | Enter < 10 digits | Error: "Invalid phone number" | ⬜ |
| 8 | Password strength | Enter weak password | Warning shown | ⬜ |
| 9 | Valid input | Fill all correctly | Next button enabled | ⬜ |

#### Test Cases — Step 3: Role-Specific Fields

**USER Role:**
| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 10 | Blood group | Select from dropdown | Selection saved | ⬜ |
| 11 | Medical info | Enter text | Saved | ⬜ |
| 12 | Stealth PIN | Enter 4-6 digits | PIN saved | ⬜ |

**GUARDIAN Role:**
| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 13 | Relation type | Select relation | Saved | ⬜ |
| 14 | Notification prefs | Toggle SMS/WhatsApp/Call | Preferences saved | ⬜ |

**ADMIN Role:**
| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 15 | Organization | Enter org name | Saved | ⬜ |
| 16 | Admin code | Enter `AEGIS-ADMIN-2026` | Validation passes | ⬜ |
| 17 | Wrong code | Enter wrong code | Error: "Invalid admin code" | ⬜ |

#### Test Cases — Step 4: Emergency Contacts (USER only)

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 18 | Add contact | Click "+ Add Contact" | New contact form appears | ⬜ |
| 19 | Contact details | Fill name, phone, relation | Saved | ⬜ |
| 20 | Multiple contacts | Add 3+ contacts | All shown in list | ⬜ |
| 21 | Remove contact | Click trash icon | Contact removed | ⬜ |

#### Test Cases — Step 5: Review & Submit

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 22 | Review summary | Check all data | All info displayed correctly | ⬜ |
| 23 | Edit button | Click edit on any section | Returns to that step | ⬜ |
| 24 | Submit | Click "Create Account" | Account created, redirect to dashboard | ⬜ |

#### Backend API Calls

**Endpoint:** `POST /api/v1/auth/register`

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "phone": "+919876543210",
    "password": "SecurePass123!",
    "role": "USER",
    "bloodGroup": "B+",
    "medicalInfo": "None",
    "stealthPin": "9999",
    "contacts": [
      {
        "name": "Mom",
        "phone": "+919876543211",
        "relation": "Mother"
      }
    ]
  }'

# Expected Response (201 Created):
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "uuid",
    "fullName": "Test User",
    "email": "test@example.com",
    "role": "USER"
  }
}
```

#### Database Verification

```sql
-- Check user created
SELECT id, full_name, email, phone, role, blood_group, stealth_pin
FROM users
WHERE email = 'test@example.com';

-- Check emergency contacts
SELECT c.id, c.name, c.phone, c.relation, c.priority
FROM emergency_contacts c
JOIN users u ON c.user_id = u.id
WHERE u.email = 'test@example.com';

-- Expected: User row + 1 contact row
```

---

### 4. 📊 Dashboard (Command Deck)

**URL:** `http://localhost:5173/app/dashboard`

#### Test Cases

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 1 | Auth required | Visit without login | Redirect to `/login` | ⬜ |
| 2 | Page loads | Visit with valid token | Dashboard with all widgets | ⬜ |
| 3 | Threat gauge | Check circular gauge | Shows risk score (0-100) with color | ⬜ |
| 4 | Real-time updates | Wait 1.5s | Numbers update automatically | ⬜ |
| 5 | Live map | Check map widget | Shows user location + markers | ⬜ |
| 6 | Risk timeline chart | Check chart | Line chart with historical data | ⬜ |
| 7 | Threat signals | Check radial chart | 6 signals with values | ⬜ |
| 8 | Active alerts | Check alerts list | Shows current SOS alerts | ⬜ |
| 9 | AI Copilot widget | Check tips | Shows personalized safety tips | ⬜ |
| 10 | System health | Check bottom bar | All services green | ⬜ |

#### Backend API Calls

**Endpoints:**
- `GET /api/v1/threat/current` — Current threat score
- `GET /api/v1/sos/active` — Active SOS alerts
- `GET /api/v1/location/latest` — Latest user location

```bash
# Get current threat score
curl -X GET http://localhost:8080/api/v1/threat/current \
  -H "Authorization: Bearer <your_jwt_token>"

# Expected Response:
{
  "score": 42,
  "level": "MEDIUM",
  "confidence": 87,
  "factors": {
    "crimeDensity": 35,
    "lighting": 60,
    "crowdDensity": 45,
    "timeOfDay": 30,
    "areaHistory": 50,
    "userBehavior": 40
  }
}
```

#### WebSocket Connection

```
Browser DevTools → Network → WS tab
- [ ] WebSocket connection established to ws://localhost:8080/ws
- [ ] Subscribed to /topic/threat-updates
- [ ] Subscribed to /topic/sos-alerts
- [ ] Receiving messages every 1.5s
```

#### Database Verification

```sql
-- Check threat scores
SELECT score, risk_level, confidence, computed_at
FROM threat_scores
WHERE user_id = '<your_user_id>'
ORDER BY computed_at DESC
LIMIT 5;

-- Check active SOS alerts
SELECT id, user_id, trigger_type, risk_level, status, created_at
FROM sos_alerts
WHERE status = 'ACTIVE'
ORDER BY created_at DESC;
```

---

### 5. 🚨 SOS Center

**URL:** `http://localhost:5173/app/sos`

#### Test Cases

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 1 | Big SOS button | Check button | Pulsing animation visible | ⬜ |
| 2 | Trigger SOS | Hold button 0.8s | SOS activated, red banner appears | ⬜ |
| 3 | 6 trigger methods | Check cards | Manual, Voice, Shake, Watch, PIN, Volume | ⬜ |
| 4 | Voice trigger | Click "Voice" card | Simulates voice trigger | ⬜ |
| 5 | Shake trigger | Click "Shake" card | Simulates shake trigger | ⬜ |
| 6 | Fake call | Click "Mom" | Fake call UI appears | ⬜ |
| 7 | Stealth calculator | Type "9999" | SOS triggers silently | ⬜ |
| 8 | Escalation ladder | Check section | 4 steps visible | ⬜ |
| 9 | Disarm SOS | Click disarm button | SOS cancelled, normal UI | ⬜ |
| 10 | Notifications | Check bottom-right | SOS notification appears | ⬜ |

#### Backend API Calls

**Endpoint:** `POST /api/v1/sos`

```bash
curl -X POST http://localhost:8080/api/v1/sos \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "triggerType": "MANUAL",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "areaName": "Connaught Place, Delhi",
    "batteryPct": 73,
    "speedMps": 0,
    "heartRate": 82
  }'

# Expected Response (201 Created):
{
  "id": "uuid",
  "userId": "user_uuid",
  "triggerType": "MANUAL",
  "riskLevel": "CRITICAL",
  "confidence": 96,
  "latitude": 28.6139,
  "longitude": 77.2090,
  "areaName": "Connaught Place, Delhi",
  "status": "ACTIVE",
  "createdAt": "2026-01-15T10:30:00Z"
}
```

**Python ML Call:** Backend calls `/ai/risk` to compute threat score

```bash
# Internal call from Spring Boot to FastAPI
POST http://localhost:8000/ai/risk
{
  "user_id": "uuid",
  "latitude": 28.6139,
  "longitude": 77.2090
}

# Expected Response:
{
  "score": 92.5,
  "confidence": 0.96,
  "risk_level": "CRITICAL",
  "factors": {...}
}
```

#### Twilio Integration Test

```bash
# Check backend logs for Twilio calls
tail -f backend/logs/aegis.log | grep -i twilio

# Expected logs:
# [Twilio] Sending SMS to +919876543211: "🚨 EMERGENCY: Test User has triggered SOS..."
# [Twilio] SMS sent successfully (SID: SMxxxxxxxxxxxx)
# [Twilio] Sending WhatsApp to +919876543211
# [Twilio] WhatsApp sent successfully
```

#### Database Verification

```sql
-- Check SOS alert created
SELECT id, user_id, trigger_type, risk_level, confidence, status, created_at
FROM sos_alerts
WHERE user_id = '<your_user_id>'
ORDER BY created_at DESC
LIMIT 1;

-- Check threat score computed
SELECT score, risk_level, confidence, factors, computed_at
FROM threat_scores
WHERE user_id = '<your_user_id>'
ORDER BY computed_at DESC
LIMIT 1;

-- Check location saved
SELECT latitude, longitude, accuracy, battery_pct, recorded_at
FROM live_locations
WHERE user_id = '<your_user_id>'
ORDER BY recorded_at DESC
LIMIT 1;
```

---

### 6. 📍 Live Tracking

**URL:** `http://localhost:5173/app/tracking`

#### Test Cases

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 1 | Map renders | Visit URL | Leaflet map with user marker | ⬜ |
| 2 | User location | Check blue marker | Shows current GPS location | ⬜ |
| 3 | Safe route toggle | Click "Safest route" | Route changes to safer path | ⬜ |
| 4 | Fastest route | Click "Fastest route" | Route changes to fastest path | ⬜ |
| 5 | Guardian watchers | Check sidebar | Shows 3 guardians watching | ⬜ |
| 6 | Journey timeline | Check timeline | 5 events with timestamps | ⬜ |
| 7 | Route safety score | Check bars | 4 progress bars (lighting, crowd, etc.) | ⬜ |
| 8 | Stats cards | Check 4 cards | ETA, Speed, Battery, Deviation | ⬜ |
| 9 | Real-time updates | Wait 1.2s | User marker moves along path | ⬜ |

#### Backend API Calls

**Endpoint:** `POST /api/v1/sos/location`

```bash
curl -X POST http://localhost:8080/api/v1/sos/location \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 28.6145,
    "longitude": 77.2095,
    "accuracy": 10.5,
    "speed": 4.2,
    "heading": 45.0,
    "batteryPct": 72
  }'

# Expected Response (200 OK):
{ "status": "updated" }
```

**Python ML Call:** `/ai/route/safest`

```bash
curl -X POST http://localhost:8000/ai/route/safest \
  -H "Content-Type: application/json" \
  -d '{
    "origin": { "lat": 28.6139, "lng": 77.2090 },
    "destination": { "lat": 28.6329, "lng": 77.2200 },
    "avoid_unsafe": true
  }'

# Expected Response:
{
  "path": [
    { "lat": 28.6139, "lng": 77.2090, "safety_score": 75 },
    { "lat": 28.6180, "lng": 77.2120, "safety_score": 82 },
    ...
  ],
  "distance_km": 2.3,
  "duration_min": 28,
  "safety_score": 85
}
```

---

### 7. 🔥 Heatmap

**URL:** `http://localhost:5173/app/heatmap`

#### Test Cases

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 1 | Map with zones | Visit URL | Map shows colored danger zones | ⬜ |
| 2 | Filter buttons | Click ALL/CRITICAL/HIGH/etc | Zones filter correctly | ⬜ |
| 3 | Zone cards | Check right sidebar | List of zones with severity | ⬜ |
| 4 | Click zone | Click any zone | Details panel opens at bottom | ⬜ |
| 5 | Stats cards | Check top | Total reports, critical zones, etc. | ⬜ |
| 6 | Color coding | Check zones | CRITICAL=red, HIGH=orange, MEDIUM=yellow, LOW=green | ⬜ |

#### Database Verification

```sql
-- Check incident reports
SELECT area_name, type, severity, verified, upvotes, created_at
FROM incident_reports
ORDER BY created_at DESC
LIMIT 10;

-- Count by severity
SELECT severity, COUNT(*) as count
FROM incident_reports
GROUP BY severity
ORDER BY severity DESC;
```

---

### 8. 👥 Community Intel

**URL:** `http://localhost:5173/app/community`

#### Test Cases

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 1 | Reports list | Visit URL | List of incident reports | ⬜ |
| 2 | File report button | Click top-right button | Modal opens | ⬜ |
| 3 | Report form | Fill area, type, severity | Form accepts input | ⬜ |
| 4 | Submit report | Click submit | Report added to top of list | ⬜ |
| 5 | Upvote button | Click thumbs up | Count increases, notification | ⬜ |
| 6 | Verified badge | Check some reports | Green "Verified" badge on some | ⬜ |
| 7 | Stats cards | Check top | Total, Verified, Contributors, Rate | ⬜ |

#### Backend API Calls

**Endpoint:** `POST /api/v1/incidents`

```bash
curl -X POST http://localhost:8080/api/v1/incidents \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "areaName": "MG Road, Bangalore",
    "type": "HARASSMENT",
    "severity": 4,
    "description": "Eve teasing near metro station",
    "isAnonymous": true,
    "latitude": 12.9716,
    "longitude": 77.5946
  }'

# Expected Response (201 Created):
{
  "id": "uuid",
  "areaName": "MG Road, Bangalore",
  "type": "HARASSMENT",
  "severity": 4,
  "verified": false,
  "upvotes": 1,
  "createdAt": "2026-01-15T10:45:00Z"
}
```

**Endpoint:** `POST /api/v1/incidents/{id}/upvote`

```bash
curl -X POST http://localhost:8080/api/v1/incidents/<incident_id>/upvote \
  -H "Authorization: Bearer <your_jwt_token>"

# Expected Response (200 OK):
{ "upvotes": 2 }
```

---

### 9. 🤖 AI Copilot

**URL:** `http://localhost:5173/app/ai`

#### Test Cases

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 1 | Chat UI | Visit URL | Chat interface with AI avatar | ⬜ |
| 2 | Initial message | Check first message | AI greets user with location | ⬜ |
| 3 | Suggestion chips | Click any chip | Question sent, AI responds | ⬜ |
| 4 | Type message | Type custom question | AI responds contextually | ⬜ |
| 5 | Action buttons | Click "Navigate" | Notification pops up | ⬜ |
| 6 | AI Context sidebar | Check right | Shows live risk, heartbeat, etc. | ⬜ |
| 7 | Capabilities section | Check list | 6 AI capabilities listed | ⬜ |

#### Backend API Calls (Simulated)

Note: AI Copilot currently uses mock responses. Future integration with `/ai/companion/chat`

---

### 10. 👁️ Guardian Portal

**URL:** `http://localhost:5173/app/guardian`

#### Test Cases

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 1 | Wards list | Visit URL | 3 ward cards visible | ⬜ |
| 2 | Ward details | Check each card | Name, location, status, HR, battery | ⬜ |
| 3 | Live map | Check map | 3 ward markers on map | ⬜ |
| 4 | Elevated risk | Check Riya's card | Amber "Elevated" badge | ⬜ |
| 5 | Action buttons | Click Track/Call/Alert | Buttons work | ⬜ |
| 6 | Online status | Check dots | Green=online, gray=offline | ⬜ |

#### Database Verification

```sql
-- Check guardian connections
SELECT gc.id, u.full_name as guardian, w.full_name as ward, gc.status
FROM guardian_connections gc
JOIN users u ON gc.guardian_id = u.id
JOIN users w ON gc.ward_id = w.id
WHERE u.email = '<guardian_email>';
```

---

### 11. 🎛️ Admin Command Center

**URL:** `http://localhost:5173/app/admin`

#### Test Cases

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 1 | Auth check | Login as non-admin | Access denied / redirect | ⬜ |
| 2 | Admin access | Login as admin | Dashboard loads | ⬜ |
| 3 | Stats cards | Check top 4 | Active SOS, Avg Response, Guardians, AI Predictions | ⬜ |
| 4 | Live ops map | Check map | SOS markers with colored zones | ⬜ |
| 5 | Alerts sidebar | Check right | Clickable alert list | ⬜ |
| 6 | Click alert | Click any alert | Card highlights | ⬜ |
| 7 | 3 charts | Check middle | Hourly, Weekly, Pie charts | ⬜ |
| 8 | City operations | Check line chart | 6 cities plotted | ⬜ |
| 9 | Dispatch actions | Click Resolve | Alert marked resolved | ⬜ |
| 10 | Infrastructure pulse | Check bottom | 8 service health boxes | ⬜ |

#### Backend API Calls

**Endpoint:** `GET /api/v1/admin/stats`

```bash
curl -X GET http://localhost:8080/api/v1/admin/stats \
  -H "Authorization: Bearer <admin_jwt_token>"

# Expected Response:
{
  "activeAlerts": 26,
  "escalatedAlerts": 3,
  "resolvedToday": 287,
  "predictionsLastHour": 14200,
  "timestamp": "2026-01-15T10:50:00Z"
}
```

---

## 🧠 AI Features Testing (12 Features)

### 1. 🎭 Deepfake Voice Defender

**URL:** `http://localhost:5173/app/features/deepfake`

#### Test Cases

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 1 | Page loads | Visit URL | Recorder UI with instructions | ⬜ |
| 2 | Start recording | Click mic button | Red recording state, waveform animation | ⬜ |
| 3 | Recording timer | Wait 5s | Timer counts up | ⬜ |
| 4 | Stop recording | Click square button | "Analyzing..." loading state | ⬜ |
| 5 | Analysis complete | Wait 2.5s | Result card appears | ⬜ |
| 6 | Authentic result | Check (60% chance) | Green check, "AUTHENTIC VOICE" | ⬜ |
| 7 | Deepfake result | Check (40% chance) | Red warning, "DEEPFAKE DETECTED" | ⬜ |
| 8 | Metrics | Check 3 cards | Spectral Anomalies, Voice Match, Confidence | ⬜ |
| 9 | Artifacts list | Check deepfake result | List of detected artifacts | ⬜ |
| 10 | History | Check sidebar | Recent scans list | ⬜ |

#### Python ML Service Call

**Endpoint:** `POST http://localhost:8000/ai/deepfake`

```bash
# Upload audio file
curl -X POST http://localhost:8000/ai/deepfake \
  -F "file=@test_audio.wav"

# Expected Response:
{
  "is_deepfake": false,
  "confidence": 0.87,
  "spectral_anomalies": 1,
  "voice_match": 0.92,
  "artifacts": []
}
```

#### ML Model Verification

```python
# In Python console
from services.deepfake_detector import DeepfakeDetector

detector = DeepfakeDetector()
print("Model loaded:", detector._loaded)
# Expected: Model loaded: True
```

---

### 2. 🧠 AI Companion Memory

**URL:** `http://localhost:5173/app/features/companion`

#### Test Cases

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 1 | Chat UI | Visit URL | Chat interface with AI avatar | ⬜ |
| 2 | Initial greeting | Check first message | Personalized greeting with name | ⬜ |
| 3 | Memory sidebar | Check right | "What I Remember" section with 4 items | ⬜ |
| 4 | Quick prompts | Click any chip | Question sent to AI | ⬜ |
| 5 | AI response | Wait 1.5s | Contextual response appears | ⬜ |
| 6 | Route question | Ask about route | AI mentions Tuesday pattern | ⬜ |
| 7 | Fear detection | Type "I'm scared" | AI detects emotion, offers comfort | ⬜ |
| 8 | Emotional state | Check sidebar | Current mood, stress level | ⬜ |
| 9 | Typing indicator | Check during response | 3 dots animation | ⬜ |
| 10 | Capabilities | Check bottom | 6 capabilities listed | ⬜ |

#### Python ML Service Call

**Endpoint:** `POST http://localhost:8000/ai/companion/chat`

```bash
curl -X POST http://localhost:8000/ai/companion/chat \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user_123",
    "message": "What route should I take today?"
  }'

# Expected Response:
{
  "message": "I remember you usually take Route A on Tuesdays...",
  "memories_used": 2,
  "pattern_detected": true,
  "suggestion": "navigate_safest"
}
```

**Endpoint:** `POST http://localhost:8000/ai/companion/remember`

```bash
curl -X POST http://localhost:8000/ai/companion/remember \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user_123",
    "content": "Aanya prefers well-lit routes",
    "category": "preferences",
    "importance": 0.8
  }'

# Expected Response:
{
  "status": "remembered",
  "user_id": "test_user_123",
  "memory_count": 5
}
```

---

### 3. 🕵️ Stalker Detector

**URL:** `http://localhost:5173/app/features/stalker`

#### Test Cases

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 1 | Page loads | Visit URL | Instructions + Start Scan button | ⬜ |
| 2 | Start scan | Click button | Progress bar animates, waveform | ⬜ |
| 3 | Scan completes | Wait 3s | Detected trackers appear | ⬜ |
| 4 | Threat detected | Check results | Red cards for following trackers | ⬜ |
| 5 | Safe tracker | Check non-following | Amber cards for passing/stationary | ⬜ |
| 6 | Tracker details | Check each card | MAC, distance, signal, duration, threat score | ⬜ |
| 7 | Risk factors | Check list | Specific reasons for threat level | ⬜ |
| 8 | Recommendation | Check following trackers | Red warning box with advice | ⬜ |
| 9 | ML model info | Check top card | "Isolation Forest" badge | ⬜ |
| 10 | Clear scan | Run scan, no trackers | Green "All clear" message | ⬜ |

#### Python ML Service Call

**Endpoint:** `POST http://localhost:8000/ai/stalker/analyze`

```bash
curl -X POST http://localhost:8000/ai/stalker/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "mac_address": "AA:BB:CC:DD:EE:FF",
    "signal_strength": -55,
    "distance_meters": 8.5,
    "duration_seconds": 2700,
    "first_seen": 1234567890,
    "last_seen": 1234570590,
    "observation_count": 23,
    "location_changes": 4
  }'

# Expected Response:
{
  "is_stalking": true,
  "threat_score": 78.5,
  "anomaly_score": -0.42,
  "pattern_match": "following",
  "confidence": 0.87,
  "risk_factors": [
    "Device is moving with you across multiple locations",
    "Tracking for 45+ minutes",
    "Seen at 4 different locations",
    "Strong signal — device is very close"
  ],
  "recommendation": "⚠ HIGH RISK: Move to public place...",
  "ml_model": "Isolation Forest (100 trees)"
}
```

#### ML Model Verification

```python
from services.stalker_ml import StalkerDetectorML, TrackerObservation

detector = StalkerDetectorML()
print("Model trained:", detector.isolation_forest is not None)
# Expected: Model trained: True

obs = TrackerObservation(
    mac_address="XX:XX:XX:XX:XX:XX",
    signal_strength=-55,
    distance_meters=10,
    duration_seconds=1800,
    first_seen=0,
    last_seen=1800,
    observation_count=15,
    location_changes=3
)
result = detector.analyze(obs)
print(f"Is stalking: {result.is_stalking}, Score: {result.threat_score}")
```

---

### 4. 📡 Mesh Network SOS

**URL:** `http://localhost:5173/app/features/mesh`

#### Test Cases

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 1 | Initial state | Visit URL | "No Signal? No Problem" with activate button | ⬜ |
| 2 | Activate mesh | Click button | Network visualization appears | ⬜ |
| 3 | Nodes appear | Wait | 8 nodes animate in | ⬜ |
| 4 | Gateway nodes | Check nodes | One marked "★ Gateway" (green) | ⬜ |
| 5 | Connections | Check lines | SVG lines between nearby nodes | ⬜ |
| 6 | Stats cards | Check bottom | Nodes, Gateways, Avg Signal, Coverage | ⬜ |
| 7 | Nodes list | Check sidebar | All nodes with details | ⬜ |
| 8 | Broadcast SOS | Click button | "Broadcasting..." state | ⬜ |
| 9 | Broadcast result | Wait 2.5s | Success card with metrics | ⬜ |
| 10 | ML model info | Check top card | "GradientBoosting + Dijkstra" badge | ⬜ |

#### Python ML Service Call

**Endpoint:** `POST http://localhost:8000/ai/mesh/broadcast`

```bash
curl -X POST http://localhost:8000/ai/mesh/broadcast \
  -H "Content-Type: application/json" \
  -d '{
    "source_node": "node_self",
    "nodes": [
      {
        "node_id": "node_self",
        "latitude": 28.6139, "longitude": 77.2090,
        "battery_pct": 85, "signal_strength": 90,
        "relay_capacity": 10, "is_internet_connected": false,
        "is_trusted": true, "mobility_score": 0.2,
        "historical_reliability": 0.95
      },
      {
        "node_id": "node_gateway",
        "latitude": 28.6145, "longitude": 77.2095,
        "battery_pct": 70, "signal_strength": 80,
        "relay_capacity": 15, "is_internet_connected": true,
        "is_trusted": true, "mobility_score": 0.1,
        "historical_reliability": 0.92
      }
    ],
    "max_hops": 5
  }'

# Expected Response:
{
  "total_routes": 1,
  "routes": [
    {
      "destination": "node_gateway",
      "hops": 1,
      "latency_ms": 245.5,
      "reliability": 0.874,
      "delivery_prob": 0.92
    }
  ]
}
```

---

### 5. 👥 Safety Pods

**URL:** `http://localhost:5173/app/features/pods`

#### Test Cases

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 1 | Pods list | Visit URL | 2 existing pods | ⬜ |
| 2 | Create pod | Enter name, click Create | New pod added, code shown | ⬜ |
| 3 | Share code | Check code box | 6-digit code with copy button | ⬜ |
| 4 | Copy code | Click copy | Code copied to clipboard | ⬜ |
| 5 | Join pod | Enter 6-digit code, click Join | Success message | ⬜ |
| 6 | Activate pod | Click "Activate" on pod | Pod becomes active | ⬜ |
| 7 | Live map | Check active pod | Map with 4 animated members | ⬜ |
| 8 | Member details | Check sidebar | All members with status | ⬜ |
| 9 | Share Code button | Click on pod | Copies code | ⬜ |
| 10 | Pod stats | Check cards | Members count, created time | ⬜ |

#### WebSocket Connection

```
Browser DevTools → Network → WS
- [ ] Connected to ws://localhost:8080/ws
- [ ] Subscribed to /topic/pod/<pod_id>/locations
- [ ] Receiving member location updates
```

#### Database Verification

```sql
-- Check safety pods
SELECT id, name, code, is_active, created_at
FROM safety_pods
ORDER BY created_at DESC
LIMIT 5;

-- Check pod members
SELECT pm.pod_id, u.full_name, pm.joined_at, pm.is_active
FROM pod_members pm
JOIN users u ON pm.user_id = u.id
WHERE pm.pod_id = '<pod_id>';
```

---

### 6. 🤝 Bystander Beacon

**URL:** `http://localhost:5173/app/features/bystander`

#### Test Cases

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 1 | Initial state | Visit URL | "You're Not Alone" with activate button | ⬜ |
| 2 | Activate beacon | Click button | "Scanning..." state | ⬜ |
| 3 | Responders appear | Wait 2.5s | 5 ranked responders | ⬜ |
| 4 | Ranking | Check order | #1 has highest trust score | ⬜ |
| 5 | Responder cards | Check each | Name, profession, trust, ETA, distance, rating | ⬜ |
| 6 | Verified badge | Check some | Green checkmark on verified | ⬜ |
| 7 | Reason text | Check each card | Why this responder is ranked high | ⬜ |
| 8 | Call button | Click Call | Simulated call action | ⬜ |
| 9 | Guide Here button | Click Guide | Simulated guidance | ⬜ |
| 10 | Stop beacon | Click Stop | Returns to initial state | ⬜ |
| 11 | Trust scoring sidebar | Check right | 7 factors with weights | ⬜ |
| 12 | Community stats | Check sidebar | 2,417 helpers, 3.2min avg, 89% success | ⬜ |

#### Python ML Service Call

**Endpoint:** `POST http://localhost:8000/ai/bystander/rank`

```bash
curl -X POST http://localhost:8000/ai/bystander/rank \
  -H "Content-Type: application/json" \
  -d '{
    "responders": [
      {
        "user_id": "u_123",
        "name": "Rahul Mehta",
        "distance_meters": 180,
        "verified_identity": true,
        "account_age_days": 500,
        "previous_responses": 15,
        "successful_help_count": 12,
        "average_rating": 4.9,
        "response_time_seconds": 45,
        "currently_active": true,
        "has_first_aid_training": true,
        "is_off_duty_police": true,
        "is_medical_professional": false,
        "gender": "male"
      }
    ],
    "top_k": 5
  }'

# Expected Response:
{
  "ranked_responders": [
    {
      "user_id": "u_123",
      "name": "Rahul Mehta",
      "overall_rank": 1,
      "trust_score": 94.2,
      "reliability_score": 88.7,
      "capability_score": 95.0,
      "eta_minutes": 2.3,
      "recommended": true,
      "reason": "Off-duty police officer • First-aid trained • 4.9★ rating"
    }
  ],
  "ml_model": "RandomForest (100 trees, 10 features)"
}
```

---

### 7. 🧬 Blockchain Evidence

**URL:** `http://localhost:5173/app/features/blockchain`

#### Test Cases

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 1 | Initial state | Visit URL | "Add Evidence" form, empty chain | ⬜ |
| 2 | Select type | Click audio/video/photo/gps | Button highlights | ⬜ |
| 3 | Enter description | Type text | Saved in input | ⬜ |
| 4 | Add to chain | Click button | New block appears | ⬜ |
| 5 | Block details | Check block | Index, timestamp, type, hash, prev hash | ⬜ |
| 6 | Add multiple | Add 3+ blocks | Chain grows, prev hashes link | ⬜ |
| 7 | Verify chain | Click Verify button | Green "Chain Valid" card | ⬜ |
| 8 | Tamper block | Click "Simulate tampering" | Block modified | ⬜ |
| 9 | Verify tampered | Click Verify again | Red "Chain Tampered" warning | ⬜ |
| 10 | Hash format | Check hashes | 64-character hex strings | ⬜ |
| 11 | Legal validity | Check sidebar | 4 legal frameworks listed | ⬜ |

#### Backend API Call (Simulated)

Note: Currently client-side SHA-256. Future: `/ai/blockchain/add` endpoint

```python
# Python hash verification
import hashlib

def verify_chain(blocks):
    for i in range(1, len(blocks)):
        expected = hashlib.sha256(
            f"{blocks[i-1]['hash']}{blocks[i]['data']}".encode()
        ).hexdigest()
        if blocks[i]['prev_hash'] != blocks[i-1]['hash']:
            return False
    return True
```

#### Database Verification

```sql
-- Check evidence chain
SELECT index, type, description, hash, prev_hash, timestamp, verified
FROM evidence_chain
ORDER BY index DESC
LIMIT 10;
```

---

### 8. 🔐 Biometric Panic

**URL:** `http://localhost:5173/app/features/biometric`

#### Test Cases

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 1 | Page sections | Visit URL | 3 sections: Enroll, Set PIN, Test | ⬜ |
| 2 | Enroll biometric | Click button | "Scanning..." animation | ⬜ |
| 3 | Enrollment complete | Wait 2s | Green "Enrolled" success card | ⬜ |
| 4 | Set duress PIN | Enter 4-6 digits | PIN saved, checkmark appears | ⬜ |
| 5 | Show/hide PIN | Click eye icon | PIN visibility toggles | ⬜ |
| 6 | Test unlock | Enter duress PIN | Red "DURESS ACTIVATED" alert | ⬜ |
| 7 | Normal unlock | Enter different PIN | Green "Normal Unlock" message | ⬜ |
| 8 | Scenario steps | Check sidebar | 6-step real-world scenario | ⬜ |
| 9 | Best practices | Check sidebar | 5 tips listed | ⬜ |
| 10 | Duress patterns | Check sidebar | 4 patterns explained | ⬜ |

#### Backend API Call (Future)

**Endpoint:** `POST /api/v1/biometric/enroll` (WebAuthn)

```bash
# Future implementation with WebAuthn API
curl -X POST http://localhost:8080/api/v1/biometric/enroll \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "credentialId": "base64...",
    "publicKey": "base64...",
    "isDuress": true
  }'
```

#### Database Verification

```sql
-- Check biometric profiles
SELECT user_id, credential_id, is_duress, enrolled_at
FROM biometric_profiles
WHERE user_id = '<user_id>';
```

---

### 9. 📿 Smart Jewelry Hub

**URL:** `http://localhost:5173/app/features/wearables`

#### Test Cases

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 1 | Device list | Visit URL | 6 device cards | ⬜ |
| 2 | Connect device | Click Connect | Button changes to Disconnect, status shows | ⬜ |
| 3 | Multiple devices | Connect 2+ | All show connected status | ⬜ |
| 4 | Test SOS | Click "Test SOS" on connected | "Analyzing gesture..." state | ⬜ |
| 5 | Gesture result | Wait 1.5s | Detected gesture with confidence | ⬜ |
| 6 | Probability bars | Check bars | 6 gesture classes with % | ⬜ |
| 7 | Disconnect | Click Disconnect | Device disconnected | ⬜ |
| 8 | ML architecture | Check sidebar | Input, hidden layers, output | ⬜ |
| 9 | SOS gestures | Check sidebar | 4 gestures with icons | ⬜ |
| 10 | Sensor features | Check sidebar | 6 features listed | ⬜ |

#### Python ML Service Call

**Endpoint:** `POST http://localhost:8000/ai/gesture/recognize`

```bash
curl -X POST http://localhost:8000/ai/gesture/recognize \
  -H "Content-Type: application/json" \
  -d '{
    "readings": [
      {"timestamp": 0.0, "accel_x": 0.1, "accel_y": 0.2, "accel_z": 9.8, "gyro_x": 10, "gyro_y": 5, "gyro_z": 2},
      ... (50 readings)
    ]
  }'

# Expected Response:
{
  "gesture": "sos_shake",
  "confidence": 0.91,
  "is_sos_trigger": true,
  "all_scores": {
    "idle": 0.02,
    "walking": 0.03,
    "sos_tap": 0.04,
    "sos_double_tap": 0.01,
    "sos_shake": 0.91,
    "sos_press": 0.05
  },
  "features_used": 17,
  "ml_model": "MLPClassifier (64→32 neurons, 17 features)"
}
```

---

### 10. 🚶 Walk With Me AI

**URL:** `http://localhost:5173/app/features/walk`

#### Test Cases

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 1 | Initial state | Visit URL | "Start Your Walk" with button | ⬜ |
| 2 | Start walk | Click button | Walk begins, stats appear | ⬜ |
| 3 | AI avatar | Check top | Sparkles icon, "Speaking..." status | ⬜ |
| 4 | Live stats | Check 4 cards | Distance, Walking time, Messages, Mood | ⬜ |
| 5 | First message | Wait 1s | AI greets user | ⬜ |
| 6 | Subsequent messages | Wait 8s intervals | More messages appear | ⬜ |
| 7 | Voice output | Check (if enabled) | Browser speaks messages | ⬜ |
| 8 | Voice toggle | Click speaker icon | Voice on/off | ⬜ |
| 9 | End walk | Click button | Walk stops, returns to initial | ⬜ |
| 10 | NLP pipeline | Check sidebar | Sentiment, Emotion, Intent, Voice, Memory | ⬜ |
| 11 | Emotion detection | Check sidebar | 7 emotions with emojis | ⬜ |
| 12 | Psychological benefits | Check sidebar | 5 benefits listed | ⬜ |

#### Python ML Service Call

**Endpoint:** `POST http://localhost:8000/ai/walk/chat`

```bash
curl -X POST http://localhost:8000/ai/walk/chat \
  -H "Content-Type: application/json" \
  -d '{
    "user_message": "I think someone is following me, I am scared",
    "user_name": "Aanya",
    "walk_stage": "middle"
  }'

# Expected Response:
{
  "message": "I understand you are feeling worried. You are not alone...",
  "detected_emotion": "fear",
  "emotion_confidence": 0.82,
  "intent": "comfort",
  "should_alert": false,
  "suggested_action": "share_location",
  "ml_models": ["DistilBERT sentiment", "RoBERTa emotion"]
}
```

---

### 11. 🧘 Post-Incident Care

**URL:** `http://localhost:5173/app/features/trauma`

#### Test Cases

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 1 | Supportive message | Visit URL | "You're safe now" card | ⬜ |
| 2 | Mood check | Click mood emoji | Emoji highlights | ⬜ |
| 3 | Low mood response | Select Anxious/Sad | Validation message appears | ⬜ |
| 4 | Breathing exercise | Click "Start Breathing" | Animated circle appears | ⬜ |
| 5 | Breathing phases | Watch animation | "Breathe In" → "Hold" → "Breathe Out" | ⬜ |
| 6 | Circle scaling | Watch circle | Scales 1.2 → 1.0 → 0.8 | ⬜ |
| 7 | Cycle counter | Check below | "Cycle 1", "Cycle 2", etc. | ⬜ |
| 8 | Stop breathing | Click Stop | Returns to start state | ⬜ |
| 9 | Grounding 5-4-3-2-1 | Click each step | Checkmarks appear | ⬜ |
| 10 | Therapists | Check sidebar | 3 therapist cards | ⬜ |
| 11 | Video/Call buttons | Click on therapist | Simulated action | ⬜ |
| 12 | Crisis hotlines | Check sidebar | 3 hotlines listed | ⬜ |
| 13 | CBT techniques | Check sidebar | 5 techniques listed | ⬜ |

#### Python ML Service Call

**Endpoint:** `POST http://localhost:8000/ai/trauma/coach`

```bash
curl -X POST http://localhost:8000/ai/trauma/coach \
  -H "Content-Type: application/json" \
  -d '{
    "user_message": "I am feeling very scared and anxious after what happened",
    "user_name": "Aanya"
  }'

# Expected Response:
{
  "message": "I know this feels scary, Aanya, but you're doing great...",
  "severity_level": "moderate",
  "recommend_professional": false,
  "breathing_exercise": {
    "name": "4-7-8 Relaxation",
    "pattern": [4, 7, 8, 0],
    "description": "Activates parasympathetic nervous system"
  }
}
```

**Endpoint:** `GET http://localhost:8000/ai/trauma/therapists`

```bash
curl -X GET "http://localhost:8000/ai/trauma/therapists?location=Delhi"

# Expected Response:
{
  "therapists": [
    {
      "name": "Dr. Priya Mehta",
      "credentials": "PhD Clinical Psychology",
      "specialties": ["PTSD", "Trauma Recovery", "EMDR"],
      "experience_years": 12,
      "rating": 4.9,
      "availability": "Available now",
      "session_fee": "Free (AEGIS partnership)"
    }
  ]
}
```

---

### 12. ⚖️ One-Tap Legal Aid

**URL:** `http://localhost:5173/app/features/legal`

#### Test Cases

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 1 | Incident form | Visit URL | Form with IPC sections, date, location, description | ⬜ |
| 2 | Select IPC section | Click any section | Button highlights | ⬜ |
| 3 | All 8 sections | Check | stalking, harassment, assault, eveTeasing, cyberStalking, threat, voyeurism, acidAttack | ⬜ |
| 4 | Fill form | Enter all fields | Form accepts input | ⬜ |
| 5 | Generate FIR | Click button | "Generating FIR with AI..." loading | ⬜ |
| 6 | FIR draft | Wait 2.5s | Complete FIR document appears | ⬜ |
| 7 | FIR sections | Check draft | Complainant, Incident, Description, Accused, IPC, Evidence, Prayer | ⬜ |
| 8 | IPC sections in draft | Check | PRIMARY + ADDITIONAL sections listed | ⬜ |
| 9 | Evidence section | Check | 4 SHA-256 verified items | ⬜ |
| 10 | Matched lawyers | Check below | 3 lawyer cards | ⬜ |
| 11 | Pro bono badge | Check | Green "PRO BONO" on some | ⬜ |
| 12 | Video/Call buttons | Click | Simulated action | ⬜ |
| 13 | Legal rights | Check sidebar | 6 rights listed | ⬜ |
| 14 | Emergency contacts | Check sidebar | 4 hotlines | ⬜ |
| 15 | Edit button | Click | Returns to form | ⬜ |

#### Python ML Service Call

**Endpoint:** `POST http://localhost:8000/ai/legal/fir`

```bash
curl -X POST http://localhost:8000/ai/legal/fir \
  -H "Content-Type: application/json" \
  -d '{
    "user_name": "Aanya Kapoor",
    "user_phone": "+919876543210",
    "incident_type": "stalking",
    "date": "2026-01-15",
    "location": "Connaught Place, New Delhi",
    "description": "A man has been following me for the past 3 days...",
    "accused": "Unknown",
    "witnesses": [],
    "evidence": ["GPS logs", "Audio recording"]
  }'

# Expected Response:
{
  "fir_text": "FIRST INFORMATION REPORT\nUnder Section 154...",
  "ipc_sections": [
    {
      "primary": "354D",
      "title": "Stalking",
      "description": "Following/contacting woman despite clear disinterest",
      "punishment": "Up to 3 years + fine"
    }
  ],
  "evidence_checklist": [
    "GPS location logs with timestamps",
    "Audio/video recordings (SHA-256 verified)",
    ...
  ],
  "recommended_ps": "Connaught Place Police Station",
  "legal_rights": [
    "Right to file FIR at any police station (Zero FIR)",
    ...
  ],
  "lawyer_suggestions": [
    {
      "name": "Adv. Meera Krishnan",
      "specialty": "Women's Safety & Criminal Law",
      "experience": "12 years",
      "success_rate": "95%",
      "availability": "Available now",
      "pro_bono": true
    }
  ]
}
```

---

## 📱 Mobile App Testing

### Setup

```bash
cd mobile
npm install
npx expo start

# Scan QR code with Expo Go app on phone
```

### Test Cases — All Screens

| # | Screen | Test | Expected Result | Status |
|---|--------|------|-----------------|--------|
| 1 | Login | Form renders | Email, password, role selector | ⬜ |
| 2 | Login | Valid login | Redirect to Dashboard | ⬜ |
| 3 | Register | 5-step flow | All steps work | ⬜ |
| 4 | Dashboard | Stats update | Numbers change every 1.5s | ⬜ |
| 5 | SOS | Hold button | SOS triggered, haptics | ⬜ |
| 6 | Tracking | Map renders | Shows location + path | ⬜ |
| 7 | Features | Hub loads | 12 feature cards | ⬜ |
| 8 | Deepfake | Record + analyze | Result shows | ⬜ |
| 9 | Companion | Chat works | AI responds | ⬜ |
| 10 | Stalker | Scan + detect | Trackers shown | ⬜ |
| 11 | Mesh | Activate + broadcast | Nodes appear | ⬜ |
| 12 | Pods | Create + join | Pods listed | ⬜ |
| 13 | Bystander | Activate + rank | Responders ranked | ⬜ |
| 14 | Blockchain | Add + verify | Chain works | ⬜ |
| 15 | Biometric | Enroll + test | Duress works | ⬜ |
| 16 | Wearables | Connect + test | Gesture detected | ⬜ |
| 17 | Walk | Start + listen | AI talks (TTS) | ⬜ |
| 18 | Trauma | Breathing | Circle animates | ⬜ |
| 19 | Legal | Generate FIR | Draft appears | ⬜ |
| 20 | Settings | Theme toggle | Light/Dark switches | ⬜ |

### Mobile-Specific Tests

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 1 | Haptic feedback | Trigger SOS | Phone vibrates | ⬜ |
| 2 | GPS permission | Request location | Permission dialog | ⬜ |
| 3 | Camera permission | Open camera feature | Permission dialog | ⬜ |
| 4 | Mic permission | Record audio | Permission dialog | ⬜ |
| 5 | Accelerometer | Shake phone | Shake detected | ⬜ |
| 6 | TTS | Walk With Me | Phone speaks | ⬜ |
| 7 | Secure storage | Save JWT | Stored in Keychain/Keystore | ⬜ |
| 8 | Push notifications | Trigger SOS | Notification received | ⬜ |
| 9 | Offline mode | Disable internet | Demo mode works | ⬜ |
| 10 | Orientation | Rotate phone | Layout adapts | ⬜ |

---

## 🔌 Backend API Testing

### Authentication Endpoints

#### POST /api/v1/auth/register

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "phone": "+919876543210",
    "password": "SecurePass123!",
    "role": "USER"
  }'

# Expected: 201 Created with JWT tokens
```

#### POST /api/v1/auth/login

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'

# Expected: 200 OK with JWT tokens
```

#### POST /api/v1/auth/refresh

```bash
curl -X POST http://localhost:8080/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
  }'

# Expected: 200 OK with new tokens
```

### SOS Endpoints

#### POST /api/v1/sos

```bash
curl -X POST http://localhost:8080/api/v1/sos \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "triggerType": "MANUAL",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "areaName": "Test Area"
  }'

# Expected: 201 Created
```

#### GET /api/v1/sos/active

```bash
curl -X GET http://localhost:8080/api/v1/sos/active \
  -H "Authorization: Bearer <token>"

# Expected: 200 OK with active alerts array
```

#### POST /api/v1/sos/{id}/resolve

```bash
curl -X POST http://localhost:8080/api/v1/sos/<alert_id>/resolve \
  -H "Authorization: Bearer <token>"

# Expected: 200 OK
```

### Incident Endpoints

#### POST /api/v1/incidents

```bash
curl -X POST http://localhost:8080/api/v1/incidents \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "areaName": "Test Area",
    "type": "HARASSMENT",
    "severity": 4,
    "isAnonymous": true
  }'

# Expected: 201 Created
```

#### GET /api/v1/incidents?page=0&size=25

```bash
curl -X GET "http://localhost:8080/api/v1/incidents?page=0&size=25"

# Expected: 200 OK with paginated results
```

#### POST /api/v1/incidents/{id}/upvote

```bash
curl -X POST http://localhost:8080/api/v1/incidents/<id>/upvote \
  -H "Authorization: Bearer <token>"

# Expected: 200 OK
```

### Admin Endpoints

#### GET /api/v1/admin/stats

```bash
curl -X GET http://localhost:8080/api/v1/admin/stats \
  -H "Authorization: Bearer <admin_token>"

# Expected: 200 OK with stats object
```

---

## 🧠 Python ML Services Testing

### Start FastAPI Server

```bash
cd ai-services
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

### Access API Docs

Open browser: `http://localhost:8000/docs`

### Test All 18 Endpoints

| # | Endpoint | Method | Test | Status |
|---|----------|--------|------|--------|
| 1 | `/health` | GET | Returns status | ⬜ |
| 2 | `/ai/risk` | POST | Risk prediction | ⬜ |
| 3 | `/ai/voice/transcribe` | POST | Audio transcription | ⬜ |
| 4 | `/ai/emotion` | POST | Emotion detection | ⬜ |
| 5 | `/ai/camera/detect` | POST | Object detection | ⬜ |
| 6 | `/ai/route/safest` | POST | Safe route | ⬜ |
| 7 | `/ai/deepfake` | POST | Deepfake detection | ⬜ |
| 8 | `/ai/companion/chat` | POST | AI chat | ⬜ |
| 9 | `/ai/companion/remember` | POST | Store memory | ⬜ |
| 10 | `/ai/legal/fir` | POST | Generate FIR | ⬜ |
| 11 | `/ai/trauma/coach` | POST | Trauma support | ⬜ |
| 12 | `/ai/trauma/therapists` | GET | List therapists | ⬜ |
| 13 | `/ai/stalker/analyze` | POST | Stalker detection | ⬜ |
| 14 | `/ai/stalker/batch` | POST | Batch analysis | ⬜ |
| 15 | `/ai/walk/chat` | POST | Walk companion | ⬜ |
| 16 | `/ai/walk/emotion` | POST | Emotion analysis | ⬜ |
| 17 | `/ai/bystander/rank` | POST | Rank responders | ⬜ |
| 18 | `/ai/mesh/route` | POST | Mesh routing | ⬜ |
| 19 | `/ai/mesh/broadcast` | POST | Mesh broadcast | ⬜ |
| 20 | `/ai/gesture/recognize` | POST | Gesture recognition | ⬜ |
| 21 | `/ai/gesture/sos-pattern` | POST | SOS pattern | ⬜ |

### ML Model Loading Verification

```bash
# Check server logs for model loading
tail -f /tmp/uvicorn.log | grep -i "loaded\|ready"

# Expected logs:
# ✓ Isolation Forest trained with 500 samples
# ✓ Bystander ML models trained (trust + reliability)
# ✓ Mesh routing ML model trained
# ✓ Walk With Me ML models loaded
# ✓ Gesture ML trained on 600 samples
# ✓ All AI services ready (12 features + 5 ML models loaded)
```

---

## 🗄️ Database Verification

### Connect to PostgreSQL

```bash
psql -h localhost -U aegis -d aegis
# Password: aegis_secret
```

### Verify All 11 Tables Exist

```sql
\dt

# Expected tables:
# users
# emergency_contacts
# guardian_connections
# sos_alerts
# live_locations
# incident_reports
# threat_scores
# evidence_files
# notifications
# emergency_logs
# safety_pods (if created)
# pod_members (if created)
# companion_memories (if created)
# stalker_logs (if created)
# mesh_nodes (if created)
# verified_helpers (if created)
# evidence_chain (if created)
# biometric_profiles (if created)
# wearable_devices (if created)
# walk_sessions (if created)
# therapy_sessions (if created)
# legal_cases (if created)
# fir_drafts (if created)
```

### Sample Queries

```sql
-- Count users by role
SELECT role, COUNT(*) as count
FROM users
GROUP BY role;

-- Recent SOS alerts
SELECT id, user_id, trigger_type, risk_level, status, created_at
FROM sos_alerts
ORDER BY created_at DESC
LIMIT 10;

-- Top reported areas
SELECT area_name, COUNT(*) as reports, AVG(severity) as avg_severity
FROM incident_reports
GROUP BY area_name
ORDER BY reports DESC
LIMIT 10;

-- Active guardian connections
SELECT u.full_name as guardian, COUNT(gc.ward_id) as wards
FROM guardian_connections gc
JOIN users u ON gc.guardian_id = u.id
WHERE gc.status = 'ACTIVE'
GROUP BY u.full_name;

-- Threat score distribution
SELECT risk_level, COUNT(*) as count
FROM threat_scores
WHERE computed_at > NOW() - INTERVAL '24 hours'
GROUP BY risk_level;
```

### Check Flyway Migrations

```sql
SELECT version, description, success, installed_on
FROM flyway_schema_history
ORDER BY installed_rank;

# Expected:
# version | description     | success | installed_on
# --------|-----------------|---------|------------------
# 1       | init schema     | t       | 2026-01-15 10:00:00
# 2       | new features    | t       | 2026-01-15 10:05:00
```

---

## 🔌 WebSocket Real-Time Testing

### Connect to WebSocket

Open browser DevTools → Console → Run:

```javascript
const socket = new WebSocket('ws://localhost:8080/ws');

socket.onopen = () => {
  console.log('✓ WebSocket connected');

  // Subscribe to threat updates
  socket.send(JSON.stringify({
    type: 'subscribe',
    destination: '/topic/threat-updates'
  }));

  // Subscribe to SOS alerts
  socket.send(JSON.stringify({
    type: 'subscribe',
    destination: '/topic/sos-alerts'
  }));
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};

socket.onerror = (error) => {
  console.error('WebSocket error:', error);
};

socket.onclose = () => {
  console.log('WebSocket closed');
};
```

### Expected Messages

```
✓ WebSocket connected
Received: { type: 'threat-update', score: 42, level: 'MEDIUM', timestamp: '...' }
Received: { type: 'sos-alert', id: 'uuid', userId: 'uuid', triggerType: 'MANUAL', ... }
```

### Trigger SOS and Verify Broadcast

1. Trigger SOS via UI or API
2. Check WebSocket messages
3. Verify alert appears in real-time on Dashboard and Admin Command Center

---

## 🔗 Integration Testing

### End-to-End Flow: User Triggers SOS

```
1. User logs in → POST /api/v1/auth/login
   ✓ JWT token received
   ✓ Stored in localStorage

2. User clicks SOS button → POST /api/v1/sos
   ✓ Spring Boot receives request
   ✓ Calls Python /ai/risk for threat score
   ✓ Saves to sos_alerts table
   ✓ Saves to threat_scores table
   ✓ Saves to live_locations table
   ✓ Sends Twilio SMS to emergency contacts
   ✓ Broadcasts via WebSocket /topic/sos-alerts

3. Frontend receives WebSocket message
   ✓ Dashboard updates with new alert
   ✓ Notification pops up
   ✓ Admin Command Center shows alert

4. Guardian receives SMS
   ✓ Message: "🚨 EMERGENCY: Aanya has triggered SOS at Connaught Place..."
   ✓ Includes live location link

5. Admin resolves alert → POST /api/v1/sos/{id}/resolve
   ✓ Status changed to RESOLVED
   ✓ WebSocket broadcasts resolution
   ✓ Frontend updates
```

### Test Each Step

- [ ] Login successful
- [ ] SOS triggered
- [ ] Python ML called
- [ ] Database updated (3 tables)
- [ ] Twilio SMS sent
- [ ] WebSocket broadcast
- [ ] Frontend updates
- [ ] Admin can resolve

---

## ⚠️ Edge Cases & Error Handling

### Authentication Errors

| # | Scenario | Expected Behavior | Status |
|---|----------|-------------------|--------|
| 1 | Expired JWT | Auto-refresh or redirect to login | ⬜ |
| 2 | Invalid JWT | 401 Unauthorized | ⬜ |
| 3 | No JWT | Redirect to login | ⬜ |
| 4 | Wrong password | Error message shown | ⬜ |
| 5 | User not found | Error message shown | ⬜ |

### Network Errors

| # | Scenario | Expected Behavior | Status |
|---|----------|-------------------|--------|
| 1 | Backend down | "Server unavailable" message | ⬜ |
| 2 | Slow network | Loading spinners shown | ⬜ |
| 3 | Request timeout | Retry or error message | ⬜ |
| 4 | WebSocket disconnect | Auto-reconnect | ⬜ |
| 5 | Offline mode | Demo mode activates | ⬜ |

### Input Validation

| # | Scenario | Expected Behavior | Status |
|---|----------|-------------------|--------|
| 1 | Empty email | Validation error | ⬜ |
| 2 | Invalid email format | Validation error | ⬜ |
| 3 | Weak password | Warning shown | ⬜ |
| 4 | Invalid phone | Validation error | ⬜ |
| 5 | SQL injection attempt | Sanitized/rejected | ⬜ |
| 6 | XSS attempt | Sanitized/rejected | ⬜ |
| 7 | Very long input | Truncated/rejected | ⬜ |

### Feature-Specific Edge Cases

| # | Feature | Scenario | Expected Behavior | Status |
|---|---------|----------|-------------------|--------|
| 1 | SOS | No GPS permission | Request permission or use last known | ⬜ |
| 2 | Deepfake | No audio file | Error message | ⬜ |
| 3 | Stalker | No BLE devices | "All clear" message | ⬜ |
| 4 | Mesh | No nodes nearby | "No mesh available" | ⬜ |
| 5 | Blockchain | Empty chain | "Add first block" prompt | ⬜ |
| 6 | Biometric | Browser doesn't support WebAuthn | Fallback to PIN | ⬜ |
| 7 | Walk With Me | Browser doesn't support TTS | Text-only mode | ⬜ |
| 8 | Legal | Missing required fields | Validation errors | ⬜ |

---

## ⚡ Performance Testing

### Frontend Performance

Open Chrome DevTools → Lighthouse → Generate Report

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Performance Score | > 90 | | ⬜ |
| First Contentful Paint | < 1.5s | | ⬜ |
| Largest Contentful Paint | < 2.5s | | ⬜ |
| Time to Interactive | < 3.5s | | ⬜ |
| Cumulative Layout Shift | < 0.1 | | ⬜ |
| Total Bundle Size | < 1.5 MB | 1.32 MB | ✅ |

### Backend Performance

```bash
# Load test with Apache Bench
ab -n 1000 -c 10 http://localhost:8080/api/v1/health

# Expected:
# Requests per second: > 100
# Time per request: < 100ms
# Failed requests: 0
```

### Python ML Performance

```bash
# Test endpoint latency
time curl -X POST http://localhost:8000/ai/risk \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test", "latitude": 28.6, "longitude": 77.2}'

# Expected: < 2 seconds
```

### Database Performance

```sql
-- Check slow queries
EXPLAIN ANALYZE
SELECT * FROM sos_alerts
WHERE user_id = '<user_id>'
ORDER BY created_at DESC
LIMIT 10;

-- Expected: Uses index, < 10ms
```

---

## 🔒 Security Testing

### Authentication & Authorization

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 1 | Access without token | Call protected endpoint | 401 Unauthorized | ⬜ |
| 2 | Access with invalid token | Use fake JWT | 401 Unauthorized | ⬜ |
| 3 | Access with expired token | Use old JWT | 401 or auto-refresh | ⬜ |
| 4 | User access admin endpoint | Call /api/v1/admin/* as USER | 403 Forbidden | ⬜ |
| 5 | JWT in URL | Try passing token in query | Rejected | ⬜ |

### Input Sanitization

| # | Test | Input | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 1 | SQL injection | `' OR '1'='1` | Sanitized/rejected | ⬜ |
| 2 | XSS | `<script>alert(1)</script>` | Sanitized | ⬜ |
| 3 | Command injection | `; rm -rf /` | Rejected | ⬜ |
| 4 | Path traversal | `../../../etc/passwd` | Rejected | ⬜ |
| 5 | Buffer overflow | 10MB string | Rejected/timeout | ⬜ |

### Rate Limiting

```bash
# Test rate limiting (if implemented)
for i in {1..100}; do
  curl -X POST http://localhost:8080/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "test@test.com", "password": "wrong"}' &
done

# Expected: 429 Too Many Requests after limit
```

### CORS Configuration

```bash
curl -X OPTIONS http://localhost:8080/api/v1/auth/login \
  -H "Origin: http://evil.com" \
  -H "Access-Control-Request-Method: POST"

# Expected: No Access-Control-Allow-Origin header for evil.com
```

### HTTPS/SSL (Production)

- [ ] All endpoints use HTTPS
- [ ] Valid SSL certificate
- [ ] HSTS header present
- [ ] No mixed content

---

## ✅ Final Submission Checklist

### Code Quality

- [ ] No console errors in browser
- [ ] No TypeScript errors (`npm run build` succeeds)
- [ ] No Python errors (FastAPI starts cleanly)
- [ ] No Java errors (Spring Boot starts cleanly)
- [ ] Code is formatted (Prettier/Black)
- [ ] No hardcoded secrets in code
- [ ] All TODOs resolved

### Documentation

- [ ] README.md complete
- [ ] DEPLOYMENT.md complete
- [ ] WORKFLOW.md complete (this file)
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Code comments where needed

### Features

- [ ] All 11 core features working
- [ ] All 12 AI features working
- [ ] Mobile app working (if applicable)
- [ ] Real ML models loaded and working
- [ ] Backend APIs responding correctly
- [ ] Database tables created and populated

### Testing

- [ ] Manual testing complete (all test cases above)
- [ ] Edge cases tested
- [ ] Error handling verified
- [ ] Performance acceptable
- [ ] Security tests passed

### Demo Materials

- [ ] Demo video recorded (2-3 minutes)
- [ ] Screenshots of all features
- [ ] Pitch deck created (8-10 slides)
- [ ] Live demo script prepared

### Deployment

- [ ] Docker images built
- [ ] Docker Compose working
- [ ] Environment variables documented
- [ ] Deployment guide tested

---

## 🛠️ Troubleshooting Guide

### Common Issues

#### Issue 1: Frontend won't start

```bash
# Error: EADDRINUSE: port 5173 already in use

# Solution:
lsof -ti:5173 | xargs kill -9
# OR
npm run dev -- --port 5174
```

#### Issue 2: Backend won't start

```bash
# Error: Port 8080 already in use

# Solution:
lsof -ti:8080 | xargs kill -9
# OR change port in application.yml
```

#### Issue 3: PostgreSQL connection failed

```bash
# Error: Connection refused

# Solution:
# Check if PostgreSQL is running
docker ps | grep postgres

# If not running:
docker start aegis-postgres

# Check logs:
docker logs aegis-postgres
```

#### Issue 4: Python ML models won't load

```bash
# Error: ModuleNotFoundError: No module named 'sklearn'

# Solution:
cd ai-services
source venv/bin/activate
pip install -r requirements.txt
```

#### Issue 5: CORS errors in browser

```bash
# Error: Access to XMLHttpRequest blocked by CORS

# Solution:
# Check backend CORS config in SecurityConfig.java
# Ensure frontend URL is in allowed origins
```

#### Issue 6: WebSocket connection failed

```bash
# Error: WebSocket connection to 'ws://localhost:8080/ws' failed

# Solution:
# Check if backend WebSocket is enabled
# Check browser console for detailed error
# Verify WebSocket URL in .env.local
```

#### Issue 7: JWT token expired

```bash
# Error: 401 Unauthorized

# Solution:
# Frontend should auto-refresh
# If not, clear localStorage and login again
# Check JWT expiry settings in application.yml
```

#### Issue 8: Twilio SMS not sending

```bash
# Check backend logs:
tail -f backend/logs/aegis.log | grep -i twilio

# Verify Twilio credentials in .env
# Check Twilio account balance
# Verify phone number format (+91...)
```

#### Issue 9: Mobile app can't connect to backend

```bash
# Error: Network request failed

# Solution:
# 1. Ensure phone and computer on same WiFi
# 2. Use computer's IP instead of localhost in mobile/.env
# 3. Check firewall settings
# 4. Verify backend is running
```

#### Issue 10: Database migration failed

```bash
# Error: Flyway migration failed

# Solution:
# Check migration SQL syntax
# Verify database user has CREATE TABLE permission
# Check flyway_schema_history for failed migrations
# Clean and re-run:
docker exec -it aegis-postgres psql -U aegis -d aegis -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
# Then restart backend
```

---

## 📞 Support & Resources

### Documentation Links

- Spring Boot: https://spring.io/projects/spring-boot
- FastAPI: https://fastapi.tiangolo.com/
- React: https://react.dev/
- React Native: https://reactnative.dev/
- PostgreSQL: https://www.postgresql.org/docs/
- scikit-learn: https://scikit-learn.org/
- Hugging Face: https://huggingface.co/

### Useful Commands

```bash
# View backend logs
tail -f backend/logs/aegis.log

# View Python logs
tail -f ai-services/logs/fastapi.log

# Check database
docker exec -it aegis-postgres psql -U aegis -d aegis

# Check Redis
docker exec -it aegis-redis redis-cli

# View Docker logs
docker-compose logs -f

# Restart all services
docker-compose restart
```

---

## 🎯 Testing Summary

### Total Test Cases

- **Core Features:** 11 features × ~10 tests = **110 tests**
- **AI Features:** 12 features × ~10 tests = **120 tests**
- **Mobile App:** 20 tests
- **Backend API:** 10 endpoints × 3 tests = **30 tests**
- **Python ML:** 21 endpoints × 2 tests = **42 tests**
- **Database:** 10 queries
- **WebSocket:** 5 tests
- **Integration:** 8 tests
- **Edge Cases:** 30 tests
- **Performance:** 10 tests
- **Security:** 20 tests

**Total: ~400 test cases**

### Testing Timeline

| Phase | Duration | Focus |
|-------|----------|-------|
| Setup & Environment | 30 min | Get everything running |
| Core Features | 2 hours | Test all 11 core features |
| AI Features | 3 hours | Test all 12 AI features |
| Backend & ML | 1 hour | API and ML service tests |
| Integration | 1 hour | End-to-end flows |
| Edge Cases | 1 hour | Error handling |
| Performance | 30 min | Load and speed tests |
| Security | 30 min | Auth and input validation |
| Mobile App | 1 hour | All mobile screens |
| Documentation | 30 min | Screenshots and video |

**Total: ~11 hours**

---

## 🏆 Final Words

This WORKFLOW.md document provides **comprehensive A-to-Z testing** for the entire AEGIS platform. Follow each section systematically to ensure:

✅ All features work correctly
✅ Frontend ↔ Backend ↔ Python ↔ Database connections are solid
✅ Edge cases are handled
✅ Performance is acceptable
✅ Security is robust
✅ Demo is polished

**Good luck with your hackathon! 🚀**

---

**Document Version:** 1.0
**Last Updated:** January 2026
**Maintained By:** AEGIS Development Team
