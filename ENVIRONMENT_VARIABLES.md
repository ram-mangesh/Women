# AEGIS Platform — Environment Variables Guide

This document lists all environment variables required to deploy and run the AEGIS Women Safety Platform in production.

---

## 1. Backend Environment Variables (Spring Boot)

These variables configure the Spring Boot API service.

| Variable Name | Description | Recommended Production Value | Local Default |
|---|---|---|---|
| `SPRING_PROFILES_ACTIVE` | Active Spring profile | `prod` (or `docker`) | `dev` |
| `SPRING_DATASOURCE_URL` | JDBC URL for MySQL Database | `jdbc:mysql://<host>:<port>/<dbname>?useSSL=true` | `jdbc:mysql://localhost:3306/protect...` |
| `SPRING_DATASOURCE_USERNAME` | MySQL database username | Provided by database host | `root` |
| `SPRING_DATASOURCE_PASSWORD` | MySQL database password | Provided by database host | `mangesh@2006` |
| `SPRING_DATA_REDIS_HOST` | Hostname of the Redis instance | Provided by Redis host | `localhost` |
| `SPRING_DATA_REDIS_PORT` | Port of the Redis instance | Provided by Redis host | `6379` |
| `SPRING_DATA_REDIS_PASSWORD` | Password of the Redis instance | Provided by Redis host | *(empty)* |
| `SPRING_KAFKA_BOOTSTRAP_SERVERS`| Kafka bootstrap brokers (comma separated) | Provided by Kafka host | `localhost:9092` |
| `JWT_SECRET` | 256-bit cryptographically secure signature key | Generating using a secure random generator | `aegis-super-secret-jwt-key-...` |
| `TWILIO_ACCOUNT_SID` | Twilio API Account SID | From Twilio Console | `ACdemo` (Sandbox mode) |
| `TWILIO_AUTH_TOKEN` | Twilio API Auth Token | From Twilio Console | `demo` |
| `TWILIO_FROM_NUMBER` | Twilio SMS/Call outbound phone number | From Twilio Console | `+15054473608` |
| `TWILIO_WHATSAPP_FROM` | Twilio WhatsApp Sender Number | From Twilio Console | `whatsapp:+14155238886` |

---

## 2. Frontend Environment Variables (React/Vite)

These variables are compiled into the static React build bundle. They must be prefixed with `VITE_`.

| Variable Name | Description | Recommended Production Value | Local Default |
|---|---|---|---|
| `VITE_API_BASE_URL` | Base HTTP endpoint of the backend API | `https://api.aegis.ai` | `http://127.0.0.1:8080` |
| `VITE_WS_URL` | WebSocket endpoint of the backend | `wss://api.aegis.ai/ws` | `ws://127.0.0.1:8080/ws` |
| `VITE_AI_API_BASE_URL` | Base HTTP endpoint of FastAPI AI service | `https://ai.aegis.ai` | `http://127.0.0.1:8000` |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps Platform API key | Your production maps key | `demo` |
