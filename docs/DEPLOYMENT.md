# AEGIS — Deployment Guide

## 🏗️ Local Development

### All-in-one with Docker
```bash
cp .env.example .env
docker compose up --build
# Frontend:   http://localhost:5173
# API:        http://localhost:8080/api
# Swagger:    http://localhost:8080/api/swagger-ui.html
# AI docs:     http://localhost:8000/docs
```

### Frontend only (no backend required — demo mode)
```bash
npm install
npm run dev          # http://localhost:5173
```

### Backend only
```bash
cd backend
mvn spring-boot:run  # http://localhost:8080/api
```

### AI services only
```bash
cd ai-services
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

---

## ☁️ Cloud Deployment

### AWS (recommended)
1. **ECR** — push images:
   ```bash
   aws ecr get-login-password | docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com
   docker tag aegis-api:latest <account>.dkr.ecr.<region>.amazonaws.com/aegis/api:latest
   docker push <account>.dkr.ecr.<region>.amazonaws.com/aegis/api:latest
   ```
2. **EKS** — deploy with Helm:
   ```bash
   helm upgrade --install aegis ./infra/helm/aegis -f values.prod.yaml
   ```
3. **RDS Postgres** — connect via secrets
4. **ElastiCache Redis** — connect via secrets
5. **S3** — evidence vault (server-side AES-256)
6. **CloudFront + ACM** — TLS termination

### GCP
- **Cloud Run** for API + AI services
- **Cloud SQL** for Postgres
- **Memorystore** for Redis
- **Cloud Storage** for evidence

### Azure
- **AKS** for containers
- **Azure Database for PostgreSQL**
- **Azure Cache for Redis**
- **Blob Storage** with encryption

---

## 🔒 Secrets Management

| Variable              | Source                        |
| --------------------- | ----------------------------- |
| `JWT_SECRET`          | KMS / AWS Secrets Manager     |
| `TWILIO_*`            | Twilio console → KMS          |
| `GOOGLE_MAPS_API_KEY` | Google Cloud console → KMS    |
| `OPENAI_API_KEY`      | OpenAI → KMS                  |
| Database credentials  | Cloud-native secret manager   |

**Never commit `.env` files to version control.**

---

## 📈 Scaling Strategy

### Horizontal
- **API**: stateless → scale with HPA on CPU (target 70%)
- **AI**: GPU-backed nodes; scale independently
- **Postgres**: read replicas for GET endpoints
- **Redis**: cluster mode for session/score cache

### Vertical
- AI service: upgrade to A10G/A100 GPU for faster inference
- Postgres: increase IOPS for `sos_alerts` and `live_locations` tables

### Caching
- `threat_scores` (last 20 per user) — Redis 10-min TTL
- Incident bbox queries — Redis 5-min TTL
- User profile lookups — Redis 2-min TTL

---

## 🔍 Observability

### Logs
- JSON-structured via Logback + python-json-logger
- Ship to CloudWatch / Cloud Logging / ELK

### Metrics
- Spring Actuator + Micrometer → Prometheus
- FastAPI `prometheus_fastapi_instrumentator`
- Key metrics:
  - `sos_alerts_total` (counter by risk level)
  - `ai_risk_latency_seconds` (histogram)
  - `ws_messages_total`
  - `twilio_sms_total`, `twilio_call_total`

### Alerts
- Error rate > 1% for 5 min
- p95 latency > 500 ms
- AI service unavailable
- Active SOS > 100
- Postgres connection pool > 80%

---

## 🗺️ Rollout Checklist

- [ ] Secrets in place (JWT, Twilio, Maps, DB)
- [ ] Domain + TLS cert issued
- [ ] DNS A record → load balancer
- [ ] Smoke test: register → login → trigger SOS → receive SMS
- [ ] Load test: `k6 run loadtest.js` — target 500 RPS
- [ ] Security scan: OWASP ZAP
- [ ] Backup verified (Postgres daily snapshot)
- [ ] Monitoring + alerts configured
- [ ] Runbook documented for on-call
