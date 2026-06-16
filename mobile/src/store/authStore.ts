/**
 * Auth store — same logic as web, connects to real backend when available.
 */
import { create } from "zustand";
import { authApi, type AuthResponse } from "../api/endpoints";
import { isBackendAvailable } from "../api/client";

export type Role = "USER" | "GUARDIAN" | "ADMIN" | "POLICE";

interface AuthState {
  user: AuthResponse | null;
  loading: boolean;
  login: (email: string, password: string, role?: Role) => Promise<void>;
  register: (input: any) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,

  login: async (email, password, role = "USER") => {
    set({ loading: true });
    if (isBackendAvailable()) {
      try {
        const data = await authApi.login(email, password);
        set({ user: data, loading: false });
        return;
      } catch (e: any) {
        console.error("[auth] login failed, error:", e?.message);
        console.warn("[auth] login failed, demo mode");
      }
    }
    // Demo fallback
    set({
      user: {
        accessToken: "demo",
        refreshToken: "demo",
        tokenType: "Bearer",
        expiresInMs: 900000,
        userId: "demo-" + role,
        fullName: email.split("@")[0].replace(/\b\w/g, (c) => c.toUpperCase()),
        email,
        role,
      },
      loading: false,
    });
  },

  register: async (input) => {
    set({ loading: true });
    if (isBackendAvailable()) {
      try {
        const data = await authApi.register(input);
        set({ user: data, loading: false });
        return;
      } catch (e: any) {
        console.error("[auth] register failed, error:", e?.message);
        console.warn("[auth] register failed, demo mode");
      }
    }
    set({
      user: {
        accessToken: "demo", refreshToken: "demo", tokenType: "Bearer",
        expiresInMs: 900000, userId: "demo-" + input.role,
        fullName: input.fullName, email: input.email,
        role: input.role || "USER",
      },
      loading: false,
    });
  },

  logout: async () => {
    if (isBackendAvailable()) await authApi.logout();
    set({ user: null });
  },
}));
