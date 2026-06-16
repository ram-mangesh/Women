# Google Fit Integration Flow - Architecture & Implementation

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER / PATIENT                          │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
        ┌────────────────────────────────────────┐
        │   Google Fit Dashboard (React)         │
        │  - GoogleFitDashboard.jsx              │
        │  - VitalsPage.jsx (container)          │
        └────────────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
    ┌──────────────────┐      ┌──────────────────────┐
    │ OAuth2 Login     │      │  Load Live Data      │
    │ (Google ID Svcs)│      │ (GoogleFitService)   │
    └──────────────────┘      └──────────────────────┘
              │                             │
              └──────────────┬──────────────┘
                             ▼
        ┌────────────────────────────────────────┐
        │   Google Fitness REST API              │
        │ https://www.googleapis.com/fitness/    │
        │  - Heart Rate Data (hourly buckets)    │
        │  - Steps (daily buckets)               │
        │  - Sleep (segments)                    │
        │  - Calories, Distance, SpO2            │
        └────────────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
    ┌──────────────────┐      ┌──────────────────────┐
    │  Display Charts  │      │  Convert to Payload  │
    │  - ActivityRing  │      │ (convertToSyncPayload)
    │  - HeartRate     │      └──────────────────────┘
    │  - Steps/Sleep   │                      │
    └──────────────────┘                      ▼
              │                   ┌────────────────────┐
              │                   │   Sync to Backend  │
              │                   │  POST /patient/    │
              │                   │  vitals/sync-fit   │
              │                   └────────────────────┘
              │                             │
              └─────────────────┬───────────┘
                                ▼
                ┌────────────────────────────────────┐
                │  Spring Boot Backend (Java)        │
                │  - VitalReadingController          │
                └────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
        ┌────────────────────┐   ┌──────────────────┐
        │ VitalReadingService│   │ AI Analysis      │
        │ - Process readings │   │ - Anomaly detect │
        │ - Validate data    │   │ - Generate alerts│
        │ - Persist to DB    │   │ - Add insights   │
        └────────────────────┘   └──────────────────┘
                    │                       │
                    └───────────┬───────────┘
                                ▼
                ┌────────────────────────────────────┐
                │   PostgreSQL/MySQL Database        │
                │   - vital_readings table           │
                │   - Indexes on patient_id & dates  │
                │   - AI analysis fields             │
                └────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
        ┌────────────────────┐   ┌──────────────────┐
        │  Medical Records   │   │  Alert System    │
        │  - History         │   │ - Critical vitals│
        │  - Trending        │   │ - Notifications  │
        │  - Doctor access   │   │ - Emergency SOS  │
        └────────────────────┘   └──────────────────┘
```

## Frontend Data Flow

### 1. Authentication Phase
```
User clicks "Connect Google Fit"
        ↓
GoogleFitDashboard.handleConnect()
        ↓
initTokenClient() via Google Identity Services
        ↓
User grants permissions (OAuth2 consent screen)
        ↓
Receives access_token
        ↓
Store in sessionStorage['google_fit_token']
        ↓
setConnected(true)
```

### 2. Data Fetch Phase
```
loadLiveData(token) is triggered
        ↓
Import GoogleFitService functions
        ↓
Parallel fetch operations:
  ├─ fetchTodaySummary(token)
  ├─ fetchHeartRateData(token)
  ├─ fetchStepsData(token)
  └─ fetchWeeklyTrends(token)
        ↓
Google Fitness API responds with buckets
        ↓
Parse and format data
        ↓
Update React state:
  - summary, heartRateData, stepsData, weeklyTrends
        ↓
Render charts and metrics
```

### 3. Sync Phase
```
User clicks "Sync Now"
        ↓
handleSync() executes
        ↓
convertToSyncPayload(summary) creates payload
        ↓
POST /patient/vitals/sync-google-fit
        ↓
API response received
        ↓
Show success toast
        ↓
Update lastSync timestamp
```

## Backend Data Flow

### 1. Receive Sync Request
```
POST /patient/vitals/sync-google-fit
with GoogleFitSyncRequest payload
        ↓
Security: @PreAuthorize("hasAnyRole('PATIENT', 'CAREGIVER')")
        ↓
Extract authenticated user (UserPrincipal)
        ↓
Validate request body (@Valid annotation)
```

### 2. Service Processing
```
VitalReadingService.syncGoogleFitData(patientId, request)
        ↓
Loop through each reading in request:
  ├─ Set source = GOOGLE_FIT
  ├─ Set device info from request
  ├─ Call recordVitals(patientId, reading)
  └─ Collect results
        ↓
Return synced list to controller
```

### 3. Individual Reading Processing
```
recordVitals(patientId, VitalReadingRequest request)
        ↓
Fetch User entity by patientId
        ↓
Create new VitalReading entity
        ↓
Populate all fields from request
        ↓
Call analyzeVitals(vital)
        ↓
Save to repository
        ↓
If abnormal and alertTriggered:
  └─ Send notification
        ↓
Return saved entity
```

### 4. AI Analysis
```
analyzeVitals(VitalReading vital)
        ↓
Initialize abnormalityNotes & analysis StringBuilder
        ↓
Check each vital metric:
  ├─ Heart Rate (60-100 normal)
  ├─ Blood Pressure (<90/60 or ≥140/90 abnormal)
  ├─ O2 Saturation (<95% abnormal, <92% alert)
  ├─ Temperature (<36 or ≥38 abnormal, ≥39.5 alert)
  ├─ Blood Glucose (<70 or >125 abnormal)
  └─ Respiratory Rate (not 12-20 abnormal)
        ↓
Build explanation and actionable advice
        ↓
Set isAbnormal = true if any violation
        ↓
Set alertTriggered = true for critical values
        ↓
Populate abnormalityNotes and aiAnalysis fields
```

### 5. Data Persistence
```
vitalRepository.save(vital)
        ↓
JPA inserts into vital_readings table
        ↓
Cascade: patient relationship loaded
        ↓
Timestamps auto-filled (recordedAt, syncedAt)
        ↓
Response: VitalReading entity returned
```

## Key Components Explained

### Frontend Components

#### GoogleFitService.js
- **Purpose**: Handles all Google Fitness API interactions
- **Key Functions**:
  - `fetchTodaySummary()` - Get 24h aggregated metrics
  - `fetchHeartRateData()` - 24h heart rate with 15-min buckets
  - `fetchStepsData()` - 7-day steps with daily breakdown
  - `fetchSleepData()` - Sleep stage analysis
  - `fetchWeeklyTrends()` - 7-day averages + AI insights
  - `convertToSyncPayload()` - Format for backend

#### GoogleFitDashboard.jsx
- **Purpose**: Main UI for smartwatch data dashboard
- **Features**:
  - OAuth2 connection flow
  - Real-time data display
  - 5 tabs: Overview, Heart Rate, Activity, Sleep, AI Insights
  - Sync button to backend
  - Disconnect functionality

#### Chart Components
- **ActivityRing.jsx** - Circular progress (0-100%)
- **HeartRateChart.jsx** - Line chart with zones (rest/normal/cardio/peak)
- **StepsChart.jsx** - Bar chart with goal line
- **SleepChart.jsx** - Stacked bar with sleep stages

### Backend Components

#### VitalReadingController.java
- **Endpoints**: 6 REST endpoints for vital management
- **Security**: JWT auth + role-based access
- **Primary**: `POST /patient/vitals/sync-google-fit` for bulk sync

#### VitalReadingService.java
- **Core Logic**:
  - `syncGoogleFitData()` - Bulk sync handler
  - `recordVitals()` - Single reading processor
  - `analyzeVitals()` - AI anomaly detection
- **Notifications**: Sends alerts for critical readings

#### VitalReading.java (Entity)
- **Table**: `vital_readings`
- **Key Fields**:
  - All vital metrics (heart rate, BP, SpO2, etc.)
  - AI fields: `isAbnormal`, `abnormalityNotes`, `aiAnalysis`, `alertTriggered`
  - Timestamps: `recordedAt`, `syncedAt`
  - Device metadata: `deviceId`, `deviceModel`

#### VitalReadingRepository.java
- **Queries**:
  - Find by patient + date range
  - Find abnormal readings
  - Get recent readings since timestamp
  - Average calculations

## Google Fit API Details

### Request Structure
```json
{
  "aggregateBy": [
    {
      "dataSourceId": "derived:com.google.step_count.delta:..."
      // OR
      "dataTypeName": "com.google.sleep.segment"
    }
  ],
  "startTimeMillis": 1234567890000,
  "endTimeMillis": 1234567890000,
  "bucketByTime": { "durationMillis": 3600000 }
}
```

### Data Types Supported
| Metric | Data Type | Source |
|--------|-----------|--------|
| Steps | `com.google.step_count.delta` | Derived from device steps |
| Heart Rate | `com.google.heart_rate.bpm` | Smartwatch sensors |
| Calories | `com.google.calories.expended` | Algorithm from activity |
| Distance | `com.google.distance.delta` | GPS or steps |
| Sleep | `com.google.sleep.segment` | Wearable sleep detection |
| SpO2 | `com.google.oxygen_saturation` | O2 sensors |
| Temperature | `com.google.body.temperature` | Thermometer |

### Bucket Aggregation
- **No bucketByTime**: Returns all raw points
- **1 hour (3.6M ms)**: Hourly aggregates (for heart rate)
- **1 day (86.4M ms)**: Daily sums (for steps)
- Points within bucket are aggregated by type-specific logic

## Error Handling

### Frontend
- Network errors → Show toast notification
- 401 errors → Clear token, prompt reconnect
- Missing permissions → Display permission error
- No data → Show graceful empty state

### Backend
- Invalid payload → 400 Bad Request
- Unauthorized → 401 Unauthorized
- Patient not found → 404 Not Found
- Database error → 500 Internal Server Error

## Performance Optimizations

### Frontend
- Lazy imports of GoogleFitService
- Parallel API calls (Promise.all)
- Chart memoization
- SessionStorage token caching

### Backend
- Database indexes on (patient_id, recorded_at)
- Transactional batch inserts
- JPA query optimization
- Alert service asynchronous

## Security Considerations

1. **OAuth Token**: Never persisted on backend
2. **JWT**: API calls authenticated with JWT
3. **SQL Injection**: JPA prepared statements
4. **XSS**: React escaping
5. **CORS**: Restricted to known domains
6. **HTTPS**: All API traffic encrypted
7. **Rate Limiting**: (Optional) Prevent abuse

## Scaling Considerations

- Partition vital_readings by patient_id
- Archive old readings (>1 year)
- Caching: Redis for trending calculations
- Message queue: Async alert notifications
- Microservices: Separate AI analysis service
