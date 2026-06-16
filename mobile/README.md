# 📱 AEGIS Mobile — React Native (Expo)

Same features as the web app, same backend, now on iOS & Android with **Light/Dark mode**.

## 🚀 Quick Start

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with:
- **iOS** → Camera app (opens Expo Go)
- **Android** → Expo Go app

## 🎨 Light / Dark Mode

- Auto-detects system theme
- Manual toggle in **Settings** tab
- Stored persistently via AsyncStorage

## 🔌 Backend Connection

Mobile app connects to the same Spring Boot backend as the web app:

```
Mobile App ──axios──► Spring Boot API (port 8080)
                          │
                          ├──► PostgreSQL
                          ├──► Redis
                          ├──► Twilio (SMS/Call/WhatsApp)
                          └──► FastAPI AI (port 8000)
```

### Configure backend URL
Edit `app.json` → `expo.extra.apiBaseUrl`:
```json
{
  "extra": {
    "apiBaseUrl": "http://YOUR_IP:8080"
  }
}
```

**Important for physical device testing:**
- Phone and computer must be on same WiFi
- Replace `localhost` with your computer's local IP (e.g. `192.168.1.5`)

## 📱 Screens

| Screen | Tab | Features |
|--------|-----|----------|
| Login | Auth | Email + password + role |
| Register | Auth | Multi-step for USER/GUARDIAN/ADMIN |
| Dashboard | Home | Threat gauge + live map + stats |
| SOS | SOS | 6 triggers + haptic feedback |
| Tracking | Map | Live GPS + safe routes |
| Heatmap | Map | City danger zones |
| Community | Feed | Incident reports |
| AI Copilot | Chat | Conversational safety assistant |
| Guardian | Watch | Monitor wards |
| Admin | Ops | Command center |
| Settings | ⚙️ | Theme toggle + logout |

## 🎯 Native Features

- 📳 **Shake to SOS** — accelerometer detection
- 📍 **Live GPS** — expo-location
- 🎤 **Voice trigger** — expo-av recording
- 📷 **Camera AI** — YOLOv8 via backend
- 🔔 **Push notifications** — expo-notifications
- 🔐 **Secure storage** — expo-secure-store for JWT
- 💓 **Haptic feedback** — expo-haptics on SOS

## 🏗️ Project Structure

```
mobile/
├── App.tsx                    # Entry + providers
├── src/
│   ├── theme/                 # Light/dark colors
│   ├── api/                   # Axios + WebSocket
│   ├── store/                 # Zustand stores
│   ├── navigation/            # Stacks + tabs
│   ├── screens/               # 11 screens
│   └── components/            # Reusable UI
```

## 🧪 Test Flow

1. `npx expo start` → scan QR
2. Login with demo credentials
3. Try SOS button (haptics + animation)
4. Toggle theme in Settings
5. Watch live stats on Dashboard

## 📦 Build for Production

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

See: https://docs.expo.dev/build/setup/
