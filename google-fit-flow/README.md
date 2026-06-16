# Google Fit Integration - Complete Flow

Complete implementation of Google Fit smartwatch data integration with AI-powered health monitoring for the Health Recovery Platform.

## 📋 Project Structure

```
google-fit-flow/
├── frontend/                          # React/Vite frontend components
│   └── src/
│       ├── services/
│       │   └── GoogleFitService.js     # Google Fit API integration
│       ├── pages/vitals/
│       │   ├── GoogleFitDashboard.jsx  # Main smartwatch dashboard
│       │   └── VitalsPage.jsx          # Vitals container with tab switcher
│       └── components/charts/
│           ├── ActivityRing.jsx        # Circular progress visualization
│           ├── HeartRateChart.jsx      # 24h heart rate line chart
│           ├── StepsChart.jsx          # Weekly steps bar chart
│           └── SleepChart.jsx          # Sleep stages breakdown
│
└── backend/                           # Spring Boot Java backend
    └── src/main/java/com/recoverai/
        ├── controller/
        │   └── VitalReadingController.java      # REST API endpoints
        ├── service/
        │   └── VitalReadingService.java         # Business logic + AI analysis
        ├── request/
        │   ├── GoogleFitSyncRequest.java        # Bulk sync payload
        │   └── VitalReadingRequest.java         # Single reading payload
        ├── entity/
        │   └── VitalReading.java                # JPA entity with AI fields
        └── repository/
            └── VitalReadingRepository.java      # Data access layer
```

## 🔄 Data Flow

### Frontend Flow
1. **User Connect** → OAuth2 Google Fit login (Google Identity Services)
2. **Fetch Live Data** → Query Google Fitness API with OAuth token
3. **Display Insights** → Render charts, trends, and AI insights
4. **Sync to Backend** → POST bulk data to `/patient/vitals/sync-google-fit`

### Backend Flow
1. **Receive Sync** → `VitalReadingController.syncGoogleFit()`
2. **Process Readings** → `VitalReadingService.syncGoogleFitData()`
3. **AI Analysis** → Analyze each reading for abnormalities
4. **Trigger Alerts** → Send notifications for critical readings
5. **Persist** → Store all data with analysis metadata

## 🚀 Features

- **Live Smartwatch Data**: Real-time sync from Google Fit / Wear OS / Fitbit / Samsung Health
- **AI Health Monitoring**: Automatic anomaly detection with alerts
- **7-Day Trends**: Heart rate, steps, sleep analysis
- **Interactive Dashboard**: Activity rings, charts, and metrics
- **Backend Sync**: All data synchronized to medical records
- **Privacy First**: Never stores Google credentials

## 🔧 Frontend Setup

### Prerequisites
- Node.js 16+
- React 18+
- Vite 4+
- Google OAuth2 Client ID

### Installation
```bash
cd frontend
npm install
```

### Configuration
Replace `GOOGLE_CLIENT_ID` in `GoogleFitDashboard.jsx`:
```javascript
const GOOGLE_CLIENT_ID = 'YOUR-GOOGLE-CLIENT-ID.apps.googleusercontent.com';
```

Required scopes:
- `fitness.activity.read` - Steps, calories, distance
- `fitness.body.read` - Body metrics
- `fitness.heart_rate.read` - Heart rate data
- `fitness.sleep.read` - Sleep data
- `fitness.oxygen_saturation.read` - SpO2

### Running
```bash
npm run dev
```

## 🏗️ Backend Setup

### Prerequisites
- Java 17+
- Spring Boot 3.0+
- Maven 3.8+
- PostgreSQL/MySQL database

### Dependencies (in pom.xml)
```xml
<!-- Already included in main project -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

### Database Setup
```sql
CREATE TABLE vital_readings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    patient_id BIGINT NOT NULL,
    heart_rate INT,
    systolic_bp INT,
    diastolic_bp INT,
    oxygen_saturation INT,
    body_temperature DOUBLE,
    respiratory_rate INT,
    blood_glucose INT,
    steps INT,
    calories_burned DOUBLE,
    sleep_minutes INT,
    distance_km DOUBLE,
    source VARCHAR(50),
    device_id VARCHAR(100),
    device_model VARCHAR(100),
    is_abnormal BOOLEAN DEFAULT FALSE,
    abnormality_notes VARCHAR(1000),
    ai_analysis VARCHAR(1000),
    alert_triggered BOOLEAN DEFAULT FALSE,
    recorded_at TIMESTAMP NOT NULL,
    synced_at TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id)
);

CREATE INDEX idx_patient_recorded ON vital_readings(patient_id, recorded_at DESC);
CREATE INDEX idx_abnormal ON vital_readings(is_abnormal);
```

### Running
```bash
mvn spring-boot:run
```

## 📡 API Endpoints

### Sync Google Fit Data (Primary Endpoint)
```
POST /patient/vitals/sync-google-fit
Content-Type: application/json
Authorization: Bearer <jwt-token>

{
  "deviceId": "Google Fit Device",
  "deviceModel": "Google Fit",
  "readings": [
    {
      "heartRate": 72,
      "systolicBP": 120,
      "diastolicBP": 80,
      "oxygenSaturation": 98,
      "bodyTemperature": 36.8,
      "steps": 8234,
      "caloriesBurned": 450.5,
      "sleepMinutes": 420,
      "distanceKm": 6.5,
      "source": "GOOGLE_FIT",
      "recordedAt": "2026-05-30T14:30:00Z"
    }
  ]
}
```

### Record Single Vital
```
POST /patient/vitals
Content-Type: application/json

{
  "heartRate": 72,
  "systolicBP": 120,
  "diastolicBP": 80,
  "source": "MANUAL_ENTRY"
}
```

### Get All Vitals
```
GET /patient/vitals
Authorization: Bearer <jwt-token>
```

### Get Recent Vitals (24h)
```
GET /patient/vitals/recent?since=2026-05-29T14:30:00Z
```

### Get Vitals in Date Range
```
GET /patient/vitals/range?start=2026-05-20T00:00:00Z&end=2026-05-30T23:59:59Z
```

## 🔍 AI Analysis Logic

### Heart Rate Analysis
- **60-100 bpm**: Normal ✅
- **< 60 bpm**: Low (Bradycardia) ⚠️
- **> 100 bpm**: High (Tachycardia) ⚠️

### Blood Pressure Analysis
- **< 90/60**: Hypotension ⚠️
- **90/60 - 120/80**: Normal ✅
- **120/80 - 140/90**: Elevated ⚠️
- **≥ 140/90**: Hypertension 🚨

### Oxygen Saturation (SpO2)
- **≥ 95%**: Normal ✅
- **92-94%**: Low ⚠️
- **< 92%**: Critical 🚨 (Alert triggered)

### Temperature
- **36.1-37.2°C**: Normal ✅
- **< 36°C**: Hypothermia ⚠️
- **37.2-38°C**: Slight fever ⚠️
- **38-39.5°C**: Fever 🚨
- **≥ 39.5°C**: High fever 🚨 (Alert triggered)

### Blood Glucose
- **< 70 mg/dL**: Hypoglycemia 🚨 (Alert triggered)
- **70-100 mg/dL**: Normal ✅
- **100-125 mg/dL**: Elevated ⚠️
- **> 125 mg/dL**: High ⚠️

## 🔐 Security

- **OAuth2 Flow**: Secure Google authentication
- **JWT Tokens**: API requests validated with JWTs
- **Role-Based Access**: PATIENT, DOCTOR, CAREGIVER roles
- **No Credential Storage**: OAuth tokens never persisted
- **HTTPS Only**: All API calls encrypted

## 🧪 Testing

### Frontend Testing
```bash
npm run test
```

### Backend Testing
```bash
mvn test
```

### Manual API Testing
```bash
# Test with cURL
curl -X POST http://localhost:8080/patient/vitals/sync-google-fit \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d @payload.json
```

## 📊 Monitoring

- Check database for abnormal vitals
- Monitor alert triggers in logs
- Track sync frequency in `synced_at` timestamps
- Use Spring Boot Actuator: `/actuator/health`

## 🐛 Troubleshooting

### Frontend
- **"Google Identity Services failed to load"**: Check script tag in index.html
- **"Session expired"**: Clear sessionStorage and reconnect
- **"No data displayed"**: Ensure Google Fit has valid data

### Backend
- **401 Unauthorized**: Verify JWT token validity
- **404 Patient not found**: Check patient ID and authentication
- **Data not syncing**: Check database connection and constraints

## 📝 License

Part of Health Recovery Platform. All rights reserved.

## 🤝 Support

Contact development team for integration assistance.
