/**
 * Typed API endpoints — identical to web frontend.
 */
import { api, tokenStore } from "./client";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type TriggerType =
  | "MANUAL" | "VOICE" | "SHAKE" | "SMARTWATCH" | "STEALTH_PIN"
  | "VOLUME_PATTERN" | "EMOTION_AI" | "FALL_DETECTION" | "BEHAVIORAL_AI";

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInMs: number;
  userId: string;
  fullName: string;
  email: string;
  role: "USER" | "GUARDIAN" | "POLICE" | "ADMIN";
}

export interface SOSAlertDTO {
  id: string;
  userId: string;
  userName: string;
  triggerType: TriggerType;
  riskLevel: RiskLevel;
  confidence: number;
  latitude: number;
  longitude: number;
  areaName?: string;
  status: "ACTIVE" | "ESCALATED" | "RESOLVED" | "DISMISSED";
  batteryPct?: number;
  speedMps?: number;
  heartRate?: number;
  createdAt: string;
}

export const authApi = {
  async register(input: {
    fullName: string; email: string; phone?: string;
    password: string; role?: "USER" | "GUARDIAN" | "ADMIN";
    bloodGroup?: string; medicalInfo?: string; stealthPin?: string;
  }): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/api/v1/auth/register", input);
    await tokenStore.set(data.accessToken, data.refreshToken);
    return data;
  },
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/api/v1/auth/login", { email, password });
    await tokenStore.set(data.accessToken, data.refreshToken);
    return data;
  },
  async logout() {
    await tokenStore.clear();
  },
};

export const sosApi = {
  async trigger(input: {
    triggerType: TriggerType;
    latitude: number; longitude: number;
    areaName?: string; batteryPct?: number;
    speedMps?: number; heartRate?: number;
  }): Promise<SOSAlertDTO> {
    const { data } = await api.post<SOSAlertDTO>("/api/v1/sos", input);
    return data;
  },
  async resolve(alertId: string): Promise<SOSAlertDTO> {
    const { data } = await api.post<SOSAlertDTO>(`/api/v1/sos/${alertId}/resolve`);
    return data;
  },
  async active(): Promise<SOSAlertDTO[]> {
    const { data } = await api.get<SOSAlertDTO[]>("/api/v1/sos/active");
    return data;
  },
  async pushLocation(loc: {
    latitude: number; longitude: number;
    accuracy?: number; speed?: number; heading?: number; batteryPct?: number;
  }) {
    await api.post("/api/v1/sos/location", loc);
  },
};

export const incidentApi = {
  async list(page = 0, size = 25) {
    const { data } = await api.get("/api/v1/incidents", { params: { page, size } });
    return data;
  },
  async create(input: {
    areaName: string; type: string; severity: number;
    description?: string; isAnonymous: boolean;
    latitude?: number; longitude?: number;
  }) {
    const { data } = await api.post("/api/v1/incidents", input);
    return data;
  },
  async upvote(id: string) {
    await api.post(`/api/v1/incidents/${id}/upvote`);
  },
};

export const adminApi = {
  async stats() {
    const { data } = await api.get("/api/v1/admin/stats");
    return data;
  },
};

export const threatApi = {
  async timeline() {
    const { data } = await api.get("/api/v1/threat");
    return data;
  },
};

import { aiApi } from "./client";

export const aiServicesApi = {
  async detectDeepfake(fileUri: string): Promise<any> {
    const formData = new FormData();
    // In React Native, we append the file using its local URI, name, and type
    formData.append("file", {
      uri: fileUri,
      name: "audio.wav",
      type: "audio/wav",
    } as any);

    const { data } = await aiApi.post("/ai/deepfake", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  async analyzeStalker(payload: {
    mac_address: string; signal_strength: number; distance_meters: number;
    duration_seconds: number; first_seen: number; last_seen: number;
    observation_count: number; location_changes: number;
  }): Promise<any> {
    const { data } = await aiApi.post("/ai/stalker/analyze", payload);
    return data;
  },
};
