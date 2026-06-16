# AEGIS Platform — Production Deployment Guide

This guide describes how to deploy the AEGIS backend to Railway and the React frontend to Vercel.

---

## 1. Deploying Backend to Railway

### Prerequisites
* A [Railway Account](https://railway.app)
* GitHub repository connected to Railway

### Steps
1. **Create New Project**: Click **New Project** on Railway.
2. **Deploy from GitHub**: Select your connected `Women` repository.
3. **Configure Service**:
   - Railway will auto-detect the root `railway.json` file.
   - It will automatically run the build command `mvn -f backend/pom.xml clean package -DskipTests` and run the packaged jar file.
4. **Provision Databases**:
   - Add **MySQL** and **Redis** services to your project.
   - Railway automatically injects connection variables (`MYSQL_URL`, `REDIS_URL`, etc.).
5. **Set Environment Variables**:
   In the settings/variables of your `api` service, link the database variables to Spring Boot properties:
   - `SPRING_DATASOURCE_URL` = `${{MYSQL_URL}}`
   - `SPRING_DATASOURCE_USERNAME` = `${{MYSQLUSER}}`
   - `SPRING_DATASOURCE_PASSWORD` = `${{MYSQLPASSWORD}}`
   - `SPRING_DATA_REDIS_HOST` = `${{REDISHOST}}`
   - `SPRING_DATA_REDIS_PORT` = `${{REDISPORT}}`
   - `SPRING_DATA_REDIS_PASSWORD` = `${{REDISPASSWORD}}`
   - `SPRING_KAFKA_BOOTSTRAP_SERVERS` = *(Your Kafka Broker string)*
   - `JWT_SECRET` = *(Generate a secure key)*
   - `TWILIO_ACCOUNT_SID` = *(Your Twilio SID)*
   - `TWILIO_AUTH_TOKEN` = *(Your Twilio Token)*

---

## 2. Deploying Frontend to Vercel

### Prerequisites
* A [Vercel Account](https://vercel.com)

### Steps
1. **Import Project**: Select the `Women` repository in Vercel.
2. **Configure Build Settings**:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. **Configure Environment Variables**:
   Add the following environment variables:
   - `VITE_API_BASE_URL` = `https://<your-railway-api-domain>`
   - `VITE_WS_URL` = `wss://<your-railway-api-domain>/ws`
   - `VITE_GOOGLE_MAPS_API_KEY` = `your_google_maps_api_key`
4. **Deploy**: Click **Deploy**. Vercel will build the frontend and serve it globally with SPA routing enabled via `vercel.json`.
