/**
 * AEGIS Mobile — theme color palettes
 * Light and Dark mode with same brand identity.
 */

export const common = {
  primary: "#ff3d7f",
  primaryLight: "#ff7aa8",
  cyan: "#38e8ff",
  amber: "#ffb020",
  emerald: "#2ee6a6",
  violet: "#8b5cf6",
  danger: "#ef4444",
  warning: "#f59e0b",
  success: "#10b981",
};

export const darkTheme = {
  name: "dark" as const,
  bg: "#05060f",
  bgElevated: "#0a0d1f",
  bgCard: "rgba(255,255,255,0.05)",
  bgCardSolid: "#12152a",
  surface: "rgba(255,255,255,0.08)",
  border: "rgba(255,255,255,0.1)",
  borderStrong: "rgba(255,255,255,0.18)",
  text: "#e6e9f5",
  textDim: "#8a90a8",
  textMuted: "#5b607a",
  tabBar: "#0a0d1f",
  tabBarBorder: "rgba(255,255,255,0.08)",
  inputBg: "rgba(255,255,255,0.05)",
  shadow: "rgba(0,0,0,0.5)",
  ...common,
};

export const lightTheme = {
  name: "light" as const,
  bg: "#f7f8fc",
  bgElevated: "#ffffff",
  bgCard: "rgba(255,255,255,0.8)",
  bgCardSolid: "#ffffff",
  surface: "rgba(15,23,42,0.04)",
  border: "rgba(15,23,42,0.1)",
  borderStrong: "rgba(15,23,42,0.2)",
  text: "#0f172a",
  textDim: "#475569",
  textMuted: "#94a3b8",
  tabBar: "#ffffff",
  tabBarBorder: "rgba(15,23,42,0.08)",
  inputBg: "rgba(15,23,42,0.04)",
  shadow: "rgba(15,23,42,0.1)",
  ...common,
};

export type Theme = typeof darkTheme;
