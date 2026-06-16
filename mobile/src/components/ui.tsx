/**
 * Shared components — Card, Button, StatCard, GradientBackground.
 * All theme-aware.
 */
import React, { type ReactNode } from "react";
import { View, Text, TouchableOpacity, StyleSheet, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../theme/ThemeContext";

// ── Gradient background (light/dark adaptive) ──────────────────────
export function ScreenBg({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const { theme, isDark } = useTheme();
  if (isDark) {
    return (
      <LinearGradient
        colors={["#05060f", "#0a0d1f", "#131836"]}
        style={[StyleSheet.absoluteFill, style]}
      >
        {children}
      </LinearGradient>
    );
  }
  return (
    <LinearGradient
      colors={["#f7f8fc", "#ffffff", "#eef1f8"]}
      style={[StyleSheet.absoluteFill, style]}
    >
      {children}
    </LinearGradient>
  );
}

// ── Glass card ─────────────────────────────────────────────────────
export function Card({ children, style, glow }: { children: ReactNode; style?: ViewStyle; glow?: "pink" | "cyan" | "amber" | "emerald" }) {
  const { theme, isDark } = useTheme();
  const glowColors: Record<string, string> = {
    pink: "rgba(255,61,127,0.4)",
    cyan: "rgba(56,232,255,0.4)",
    amber: "rgba(255,176,32,0.4)",
    emerald: "rgba(46,230,166,0.4)",
  };
  return (
    <View style={[
      styles.card,
      {
        backgroundColor: isDark ? theme.bgCard : theme.bgCardSolid,
        borderColor: theme.border,
      },
      glow && {
        shadowColor: glowColors[glow],
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.6,
        shadowRadius: 24,
        elevation: 12,
      },
      style,
    ]}>
      {children}
    </View>
  );
}

// ── Primary button ─────────────────────────────────────────────────
export function PrimaryButton({
  label, onPress, icon, tone = "pink", disabled, loading,
}: {
  label: string;
  onPress: () => void;
  icon?: ReactNode;
  tone?: "pink" | "cyan" | "amber" | "emerald";
  disabled?: boolean;
  loading?: boolean;
}) {
  const gradients: Record<string, [string, string]> = {
    pink: ["#ff3d7f", "#e11d68"],
    cyan: ["#38e8ff", "#0ea5e9"],
    amber: ["#ffb020", "#f59e0b"],
    emerald: ["#2ee6a6", "#10b981"],
  };
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled || loading} activeOpacity={0.8}>
      <LinearGradient
        colors={gradients[tone]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={[styles.btn, disabled && styles.btnDisabled]}
      >
        {icon}
        <Text style={styles.btnLabel}>{loading ? "Loading…" : label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ── Stat card ──────────────────────────────────────────────────────
export function StatCard({ label, value, hint, tone = "cyan" }: {
  label: string; value: string | number; hint?: string; tone?: "pink" | "cyan" | "amber" | "emerald" | "violet";
}) {
  const { theme, isDark } = useTheme();
  const toneBg: Record<string, string> = {
    pink: "rgba(255,61,127,0.15)",
    cyan: "rgba(56,232,255,0.15)",
    amber: "rgba(255,176,32,0.15)",
    emerald: "rgba(46,230,166,0.15)",
    violet: "rgba(139,92,246,0.15)",
  };
  const toneText: Record<string, string> = {
    pink: "#ff7aa8", cyan: "#38e8ff", amber: "#ffb020", emerald: "#2ee6a6", violet: "#a78bfa",
  };
  return (
    <Card style={[styles.statCard, { borderColor: isDark ? toneBg[tone] : theme.border }]}>
      <Text style={[styles.statLabel, { color: theme.textDim }]}>{label.toUpperCase()}</Text>
      <Text style={[styles.statValue, { color: toneText[tone] }]}>{value}</Text>
      {hint && <Text style={[styles.statHint, { color: theme.textMuted }]}>{hint}</Text>}
    </Card>
  );
}

// ── Pill badge ─────────────────────────────────────────────────────
export function Pill({ label, tone = "slate" }: { label: string; tone?: "pink" | "cyan" | "amber" | "emerald" | "slate" }) {
  const { isDark } = useTheme();
  const tones: Record<string, { bg: string; text: string; border: string }> = {
    pink: { bg: "rgba(255,61,127,0.2)", text: "#ff7aa8", border: "rgba(255,61,127,0.4)" },
    cyan: { bg: "rgba(56,232,255,0.2)", text: "#38e8ff", border: "rgba(56,232,255,0.4)" },
    amber: { bg: "rgba(255,176,32,0.2)", text: "#ffb020", border: "rgba(255,176,32,0.4)" },
    emerald: { bg: "rgba(46,230,166,0.2)", text: "#2ee6a6", border: "rgba(46,230,166,0.4)" },
    slate: { bg: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)", text: isDark ? "#8a90a8" : "#475569", border: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.1)" },
  };
  const t = tones[tone];
  return (
    <View style={[styles.pill, { backgroundColor: t.bg, borderColor: t.border }]}>
      <Text style={[styles.pillText, { color: t.text }]}>{label}</Text>
    </View>
  );
}

// ── Input field ────────────────────────────────────────────────────
export function Input({
  label, value, onChangeText, placeholder, secureTextEntry, icon, error,
}: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder?: string; secureTextEntry?: boolean; icon?: ReactNode; error?: string;
}) {
  const { theme } = useTheme();
  return (
    <View style={styles.inputWrap}>
      <Text style={[styles.inputLabel, { color: theme.textDim }]}>{label}</Text>
      <View style={[styles.inputBox, {
        backgroundColor: theme.inputBg,
        borderColor: error ? theme.danger : theme.border,
      }]}>
        {icon}
        <Text></Text>
        <TextInput
          value={value} onChangeText={onChangeText}
          placeholder={placeholder} placeholderTextColor={theme.textMuted}
          secureTextEntry={secureTextEntry}
          style={[styles.inputText, { color: theme.text, flex: 1 }]}
        />
      </View>
      {error && <Text style={[styles.inputError, { color: theme.danger }]}>⚠ {error}</Text>}
    </View>
  );
}

import { TextInput } from "react-native";

// ── Styles ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  statCard: { padding: 14, borderRadius: 18 },
  statLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 1.2 },
  statValue: { fontSize: 26, fontWeight: "800", marginTop: 6, fontVariant: ["tabular-nums"] },
  statHint: { fontSize: 11, marginTop: 2 },
  btn: {
    paddingVertical: 14, paddingHorizontal: 20,
    borderRadius: 14, flexDirection: "row",
    alignItems: "center", justifyContent: "center", gap: 8,
  },
  btnDisabled: { opacity: 0.5 },
  btnLabel: { color: "#fff", fontSize: 15, fontWeight: "700" },
  pill: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 999, borderWidth: 1,
    flexDirection: "row", alignItems: "center",
  },
  pillText: { fontSize: 11, fontWeight: "700" },
  inputWrap: { marginBottom: 12 },
  inputLabel: { fontSize: 11, fontWeight: "600", marginBottom: 6, letterSpacing: 0.5 },
  inputBox: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: 12, borderWidth: 1, gap: 10,
  },
  inputText: { fontSize: 15 },
  inputError: { fontSize: 11, marginTop: 4 },
});
