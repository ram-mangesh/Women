/**
 * Safety store — manages SOS state, live location, threat scores.
 * Mirrors web store; talks to same backend endpoints.
 */
import { create } from "zustand";
import { sosApi, type TriggerType } from "../api/endpoints";
import { isBackendAvailable } from "../api/client";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface SOSAlert {
  id: string;
  user: string;
  userId: string;
  lat: number;
  lng: number;
  area: string;
  level: RiskLevel;
  confidence: number;
  trigger: string;
  time: string;
  status: "ACTIVE" | "ESCALATED" | "RESOLVED";
  battery: number;
  speed: number;
  heartbeat?: number;
}

interface SafetyState {
  sosActive: boolean;
  riskScore: number;
  riskLevel: RiskLevel;
  confidence: number;
  currentLocation: { lat: number; lng: number; area: string };
  battery: number;
  heartbeat: number;
  speed: number;
  activeAlerts: SOSAlert[];
  triggerSOS: (trigger: TriggerType, lat: number, lng: number) => Promise<void>;
  resolveSOS: (id: string) => Promise<void>;
  dismissSOS: () => void;
  tick: () => void;
  updateLocation: (lat: number, lng: number, area?: string) => void;
}

export const useSafetyStore = create<SafetyState>((set, get) => ({
  sosActive: false,
  riskScore: 42,
  riskLevel: "MEDIUM",
  confidence: 87,
  currentLocation: { lat: 28.6139, lng: 77.209, area: "Connaught Place" },
  battery: 73,
  heartbeat: 82,
  speed: 2.4,
  activeAlerts: [],

  triggerSOS: async (trigger, lat, lng) => {
    const { currentLocation, battery, heartbeat, speed } = get();
    const local: SOSAlert = {
      id: `SOS-${Date.now()}`,
      user: "You", userId: "self",
      lat, lng, area: currentLocation.area,
      level: "CRITICAL", confidence: 96,
      trigger, time: "just now",
      status: "ACTIVE", battery, speed, heartbeat,
    };
    set({
      sosActive: true, riskScore: 92, riskLevel: "CRITICAL", confidence: 96,
      activeAlerts: [local, ...get().activeAlerts],
    });
    if (isBackendAvailable()) {
      try {
        await sosApi.trigger({
          triggerType: trigger,
          latitude: lat, longitude: lng,
          areaName: currentLocation.area, batteryPct: battery,
          speedMps: speed, heartRate: heartbeat,
        });
      } catch (e) {
        console.warn("[sos] backend trigger failed", e);
      }
    }
  },

  resolveSOS: async (id) => {
    set({
      activeAlerts: get().activeAlerts.map((a) => (a.id === id ? { ...a, status: "RESOLVED" as const } : a)),
    });
    if (isBackendAvailable()) {
      try { await sosApi.resolve(id); } catch {}
    }
  },

  dismissSOS: () => {
    set({
      sosActive: false, riskScore: 42, riskLevel: "MEDIUM", confidence: 87,
      activeAlerts: get().activeAlerts.filter((a) => a.userId !== "self"),
    });
  },

  tick: () => {
    const { riskScore } = get();
    const drift = (Math.random() - 0.5) * 6;
    const newScore = Math.max(12, Math.min(94, riskScore + drift));
    const level: RiskLevel = newScore >= 80 ? "CRITICAL" : newScore >= 60 ? "HIGH" : newScore >= 35 ? "MEDIUM" : "LOW";
    set({
      riskScore: Math.round(newScore), riskLevel: level,
      confidence: Math.max(60, Math.min(99, get().confidence + (Math.random() - 0.5) * 3)),
      heartbeat: Math.max(60, Math.min(150, get().heartbeat + (Math.random() - 0.5) * 6)),
      battery: Math.max(5, get().battery - (Math.random() > 0.85 ? 1 : 0)),
      speed: Math.max(0, +(get().speed + (Math.random() - 0.5) * 0.8).toFixed(1)),
    });
  },

  updateLocation: (lat, lng, area) => {
    set({
      currentLocation: { lat, lng, area: area || get().currentLocation.area },
    });
  },
}));
