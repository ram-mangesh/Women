/**
 * Axios API client for mobile — same endpoints as web.
 * Uses expo-secure-store for JWT storage (encrypted at rest).
 */
import axios, { type InternalAxiosRequestConfig, type AxiosError } from "axios";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

const TOKEN_KEY = "aegis_access_token";
const REFRESH_KEY = "aegis_refresh_token";

// Physical device on Wi-Fi connects to the PC's LAN IP
const API_BASE = "http://10.113.57.25:8080";
const WS_BASE = "ws://10.113.57.25:8080/ws";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

export const aiApi = axios.create({
  baseURL: "http://10.113.57.25:8000",
  timeout: 30_000,
});

// ── Attach JWT ────────────────────────────────────────────────────────
api.interceptors.request.use(async (cfg: InternalAxiosRequestConfig) => {
  const t = await SecureStore.getItemAsync(TOKEN_KEY);
  if (t && cfg.headers) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

// ── Auto refresh on 401 ───────────────────────────────────────────────
let refreshing: Promise<string | null> | null = null;

api.interceptors.response.use(
  (r) => r,
  async (err: AxiosError) => {
    const original = err.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (!original) return Promise.reject(err);

    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = await SecureStore.getItemAsync(REFRESH_KEY);
      if (!refresh) {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        return Promise.reject(err);
      }
      try {
        refreshing ??= (async () => {
          const { data } = await axios.post(`${API_BASE}/api/v1/auth/refresh`, { refreshToken: refresh });
          await SecureStore.setItemAsync(TOKEN_KEY, data.accessToken);
          await SecureStore.setItemAsync(REFRESH_KEY, data.refreshToken);
          return data.accessToken as string;
        })();
        const newToken = await refreshing;
        refreshing = null;
        if (newToken && original.headers) {
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        }
      } catch (e) {
        refreshing = null;
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_KEY);
      }
    }
    return Promise.reject(err);
  }
);

export const tokenStore = {
  async set(access: string, refresh: string) {
    await SecureStore.setItemAsync(TOKEN_KEY, access);
    await SecureStore.setItemAsync(REFRESH_KEY, refresh);
  },
  async get() {
    return SecureStore.getItemAsync(TOKEN_KEY);
  },
  async clear() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
  },
};

export const isBackendAvailable = () => Boolean(API_BASE && API_BASE !== "http://localhost:8080");
