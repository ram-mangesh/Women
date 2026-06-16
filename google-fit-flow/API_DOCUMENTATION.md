# API Documentation - Google Fit Integration

## Authentication

All endpoints require JWT authentication in the `Authorization` header:
```
Authorization: Bearer <JWT_TOKEN>
```

## Base URL
```
http://localhost:8080
```

## Endpoints

### 1. Sync Google Fit Data
Bulk synchronize multiple vital readings from Google Fit.

**Endpoint:**
```
POST /patient/vitals/sync-google-fit
```

**Request Body:**
```json
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
      "respiratoryRate": 16,
      "bloodGlucose": 95,
      "steps": 8234,
      "caloriesBurned": 450.5,
      "sleepMinutes": 420,
      "distanceKm": 6.5,
      "source": "GOOGLE_FIT",
      "recordedAt": "2026-05-30T14:30:00Z"
    },
    {
      "heartRate": 68,
      "steps": 10450,
      "source": "GOOGLE_FIT",
      "recordedAt": "2026-05-30T15:30:00Z"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Google Fit data synced: 2 readings",
  "data": [
    {
      "id": 1234,
      "heartRate": 72,
      "steps": 8234,
      "isAbnormal": false,
      "aiAnalysis": "All vital signs within normal range.",
      "recordedAt": "2026-05-30T14:30:00Z",
      "syncedAt": "2026-05-30T14:35:22Z"
    },
    {
      "id": 1235,
      "heartRate": 68,
      "steps": 10450,
      "isAbnormal": false,
      "aiAnalysis": "All vital signs within normal range.",
      "recordedAt": "2026-05-30T15:30:00Z",
      "syncedAt": "2026-05-30T14:35:22Z"
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Successfully synced
- `400 Bad Request` - Invalid payload
- `401 Unauthorized` - Missing/invalid JWT
- `404 Not Found` - Patient not found

---

### 2. Record Single Vital
Record a manually entered vital reading.

**Endpoint:**
```
POST /patient/vitals
```

**Request Body:**
```json
{
  "heartRate": 75,
  "systolicBP": 125,
  "diastolicBP": 82,
  "oxygenSaturation": 97,
  "bodyTemperature": 37.0,
  "respiratoryRate": 18,
  "bloodGlucose": 102,
  "steps": null,
  "source": "MANUAL_ENTRY",
  "deviceId": "Mobile App",
  "deviceModel": "iPhone",
  "recordedAt": "2026-05-30T16:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Vital signs recorded successfully",
  "data": {
    "id": 1236,
    "heartRate": 75,
    "systolicBP": 125,
    "diastolicBP": 82,
    "oxygenSaturation": 97,
    "bodyTemperature": 37.0,
    "isAbnormal": false,
    "aiAnalysis": "All vital signs within normal range. Continue monitoring.",
    "recordedAt": "2026-05-30T16:00:00Z",
    "syncedAt": "2026-05-30T16:00:05Z"
  }
}
```

---

### 3. Get All Patient Vitals
Retrieve all vital readings for the authenticated patient.

**Endpoint:**
```
GET /patient/vitals
```

**Query Parameters:**
- `patientId` (optional) - Specific patient ID (caregiver/doctor access)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1234,
      "heartRate": 72,
      "steps": 8234,
      "isAbnormal": false,
      "recordedAt": "2026-05-30T14:30:00Z"
    },
    {
      "id": 1235,
      "heartRate": 68,
      "steps": 10450,
      "isAbnormal": false,
      "recordedAt": "2026-05-30T15:30:00Z"
    }
  ]
}
```

---

### 4. Get Recent Vitals (24 hours)
Get vitals recorded since a specific date/time.

**Endpoint:**
```
GET /patient/vitals/recent
```

**Query Parameters:**
- `since` (required) - ISO 8601 timestamp (e.g., `2026-05-29T14:30:00Z`)
- `patientId` (optional)

**Example:**
```
GET /patient/vitals/recent?since=2026-05-29T14:30:00Z
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1235,
      "heartRate": 68,
      "steps": 10450,
      "isAbnormal": false,
      "recordedAt": "2026-05-30T15:30:00Z"
    }
  ]
}
```

---

### 5. Get Vitals in Date Range
Retrieve vitals within a specific date/time range.

**Endpoint:**
```
GET /patient/vitals/range
```

**Query Parameters:**
- `start` (required) - ISO 8601 start timestamp
- `end` (required) - ISO 8601 end timestamp
- `patientId` (optional)

**Example:**
```
GET /patient/vitals/range?start=2026-05-20T00:00:00Z&end=2026-05-30T23:59:59Z
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1234,
      "heartRate": 72,
      "steps": 8234,
      "isAbnormal": false,
      "recordedAt": "2026-05-30T14:30:00Z"
    },
    {
      "id": 1235,
      "heartRate": 68,
      "steps": 10450,
      "isAbnormal": false,
      "recordedAt": "2026-05-30T15:30:00Z"
    }
  ]
}
```

---

### 6. Get Single Vital by ID
Retrieve a specific vital reading.

**Endpoint:**
```
GET /patient/vitals/{id}
```

**Example:**
```
GET /patient/vitals/1234
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1234,
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
    "deviceId": "Google Fit Device",
    "isAbnormal": false,
    "aiAnalysis": "All vital signs within normal range.",
    "recordedAt": "2026-05-30T14:30:00Z",
    "syncedAt": "2026-05-30T14:35:22Z"
  }
}
```

---

## Response Format

All responses follow this structure:

```json
{
  "success": boolean,
  "message": "Optional message",
  "data": {} or []
}
```

## Error Response Example

```json
{
  "success": false,
  "message": "Patient not found",
  "data": null
}
```

## Role-Based Access

| Endpoint | PATIENT | DOCTOR | CAREGIVER |
|----------|---------|--------|-----------|
| POST /patient/vitals | ✅ Own | ❌ | ✅ Own |
| POST /patient/vitals/sync-google-fit | ✅ Own | ❌ | ✅ Own |
| GET /patient/vitals | ✅ Own | ✅ All | ✅ Own |
| GET /patient/vitals/recent | ✅ Own | ✅ All | ✅ Own |
| GET /patient/vitals/range | ✅ Own | ✅ All | ✅ Own |
| GET /patient/vitals/{id} | ✅ Own | ✅ All | ✅ Own |

## Data Fields Reference

| Field | Type | Unit | Required | Notes |
|-------|------|------|----------|-------|
| heartRate | Integer | bpm | No | 40-180 typical range |
| systolicBP | Integer | mmHg | No | Top number |
| diastolicBP | Integer | mmHg | No | Bottom number |
| oxygenSaturation | Integer | % | No | 0-100 |
| bodyTemperature | Double | °C | No | 35-42 typical |
| respiratoryRate | Integer | breaths/min | No | 8-30 typical |
| bloodGlucose | Integer | mg/dL | No | 50-300 typical |
| steps | Integer | count | No | Daily step count |
| caloriesBurned | Double | kcal | No | Energy expended |
| sleepMinutes | Integer | minutes | No | Total sleep duration |
| distanceKm | Double | km | No | Distance traveled |
| source | Enum | - | Yes | GOOGLE_FIT, MANUAL_ENTRY, etc. |
| recordedAt | DateTime | ISO 8601 | Optional | Default: now |

## Enum Values

### ReadingSource
- `MANUAL_ENTRY` - Manually entered data
- `GOOGLE_FIT` - Google Fit / Wear OS
- `FITBIT` - Fitbit device
- `APPLE_WATCH` - Apple Watch
- `GARMIN` - Garmin device
- `SAMSUNG_HEALTH` - Samsung Health
- `WITHINGS` - Withings scale
- `OTHER_WEARABLE` - Other wearables

## Rate Limiting

Currently no rate limiting applied. Recommended:
- Max 60 requests/minute per user
- Max 1000 sync readings/request

## CORS Configuration

If frontend is on different domain:
```
Access-Control-Allow-Origin: https://yourfrontend.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

## Example cURL Requests

### Sync Google Fit
```bash
curl -X POST http://localhost:8080/patient/vitals/sync-google-fit \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "Google Fit",
    "deviceModel": "Pixel Watch",
    "readings": [{
      "heartRate": 72,
      "steps": 8234,
      "source": "GOOGLE_FIT",
      "recordedAt": "2026-05-30T14:30:00Z"
    }]
  }'
```

### Get Vitals
```bash
curl http://localhost:8080/patient/vitals \
  -H "Authorization: Bearer eyJhbGc..."
```

### Get Recent Vitals
```bash
curl "http://localhost:8080/patient/vitals/recent?since=2026-05-29T14:30:00Z" \
  -H "Authorization: Bearer eyJhbGc..."
```

---

**Last Updated:** 2026-05-30
**API Version:** 1.0
