import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { useAuthStore } from "../store/authStore";
import { useSafetyStore } from "../store/safetyStore";
import { Card, StatCard, Pill } from "../components/ui";
import ThreatGauge from "../components/ThreatGauge";

export default function DashboardScreen() {
  const { theme, isDark } = useTheme();
  const user = useAuthStore((s) => s.user);
  const {
    riskScore, riskLevel, confidence, currentLocation,
    battery, heartbeat, speed, activeAlerts, tick,
  } = useSafetyStore();

  useEffect(() => {
    const id = setInterval(tick, 1500);
    return () => clearInterval(id);
  }, [tick]);

  return (
    <LinearGradient
      colors={isDark ? ["#05060f", "#0a0d1f"] : ["#f7f8fc", "#ffffff"]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greet, { color: theme.textDim }]}>Welcome back</Text>
            <Text style={[styles.name, { color: theme.text }]}>{user?.fullName || "User"} 👋</Text>
          </View>
          <Pill label={riskLevel} tone={riskLevel === "CRITICAL" ? "pink" : riskLevel === "HIGH" ? "amber" : "emerald"} />
        </View>

        {/* Threat gauge */}
        <Card style={styles.gaugeCard} glow="pink">
          <View style={styles.gaugeHeader}>
            <Text style={[styles.cardLabel, { color: theme.textDim }]}>AI THREAT SCORE</Text>
            <View style={{ flexDirection: "row", gap: 6 }}>
              <Pill label="AI ACTIVE" tone="emerald" />
              <Pill label={`LIVE`} tone="cyan" />
            </View>
          </View>
          <View style={styles.gaugeRow}>
            <ThreatGauge score={riskScore} confidence={confidence} />
            <View style={styles.gaugeInfo}>
              <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
                <Ionicons name="location" size={14} color={theme.primary} />
                <Text style={[styles.infoLabel, { color: theme.textDim }]}>Area</Text>
                <Text style={[styles.infoValue, { color: theme.text }]} numberOfLines={1}>{currentLocation.area}</Text>
              </View>
              <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
                <Ionicons name="heart" size={14} color={theme.primary} />
                <Text style={[styles.infoLabel, { color: theme.textDim }]}>Heart</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>{Math.round(heartbeat)} bpm</Text>
              </View>
              <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
                <Ionicons name="speedometer" size={14} color={theme.primary} />
                <Text style={[styles.infoLabel, { color: theme.textDim }]}>Speed</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>{speed.toFixed(1)} m/s</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="battery-full" size={14} color={theme.emerald} />
                <Text style={[styles.infoLabel, { color: theme.textDim }]}>Battery</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>{battery}%</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Stats */}
        <View style={styles.statGrid}>
          <StatCard label="Risk" value={riskScore} hint={`${Math.round(confidence)}% conf`} tone="pink" />
          <StatCard label="Heart" value={`${Math.round(heartbeat)}`} hint="bpm" tone="cyan" />
          <StatCard label="Speed" value={speed.toFixed(1)} hint="m/s" tone="emerald" />
          <StatCard label="Battery" value={`${battery}%`} hint="device" tone="violet" />
        </View>

        {/* Active alerts */}
        <Card style={{ marginTop: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Active Alerts</Text>
            <Pill label={`${activeAlerts.length} LIVE`} tone="pink" />
          </View>
          {activeAlerts.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="shield-checkmark" size={32} color={theme.emerald} />
              <Text style={[styles.emptyText, { color: theme.textDim }]}>All clear — no active alerts</Text>
            </View>
          ) : (
            activeAlerts.slice(0, 3).map((a) => (
              <View key={a.id} style={[styles.alertRow, { borderBottomColor: theme.border }]}>
                <View style={[styles.alertAvatar, { backgroundColor: "rgba(255,61,127,0.2)" }]}>
                  <Text style={{ color: theme.primary, fontWeight: "700", fontSize: 12 }}>{a.user.slice(0, 2).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={[styles.alertUser, { color: theme.text }]}>{a.user}</Text>
                    <Pill label={a.level} tone={a.level === "CRITICAL" ? "pink" : "amber"} />
                  </View>
                  <Text style={[styles.alertMeta, { color: theme.textDim }]} numberOfLines={1}>
                    <Ionicons name="location" size={10} /> {a.area} • {a.trigger}
                  </Text>
                </View>
                <Text style={[styles.alertConf, { color: theme.primary }]}>{a.confidence}%</Text>
              </View>
            ))
          )}
        </Card>

        {/* Quick actions */}
        <Card style={{ marginTop: 16 }}>
          <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 12 }]}>AI Copilot Says</Text>
          {[
            { tone: "pink", icon: "navigate", title: "Reroute suggested", desc: "Switch to Ring Road for +31% safety" },
            { tone: "cyan", icon: "people", title: "Companion nearby", desc: "Rahul is 1.8 km away, actively tracking" },
            { tone: "emerald", icon: "home", title: "Safe shelter ahead", desc: "Verified shelter 240m to your right" },
          ].map((tip, i) => (
            <View key={i} style={[styles.tipRow, { borderBottomColor: theme.border }]}>
              <View style={[styles.tipIcon, {
                backgroundColor: tip.tone === "pink" ? "rgba(255,61,127,0.15)" : tip.tone === "cyan" ? "rgba(56,232,255,0.15)" : "rgba(46,230,166,0.15)",
              }]}>
                <Ionicons name={tip.icon as any} size={16}
                  color={tip.tone === "pink" ? theme.primary : tip.tone === "cyan" ? theme.cyan : theme.emerald} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.tipTitle, { color: theme.text }]}>{tip.title}</Text>
                <Text style={[styles.tipDesc, { color: theme.textDim }]}>{tip.desc}</Text>
              </View>
            </View>
          ))}
        </Card>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingTop: 60, paddingBottom: 100 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 },
  greet: { fontSize: 12, fontWeight: "600" },
  name: { fontSize: 24, fontWeight: "800", marginTop: 2 },
  gaugeCard: { padding: 20 },
  gaugeHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  cardLabel: { fontSize: 11, letterSpacing: 1.5, fontWeight: "700" },
  gaugeRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  gaugeInfo: { flex: 1 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8, borderBottomWidth: 1 },
  infoLabel: { fontSize: 12, flex: 1 },
  infoValue: { fontSize: 13, fontWeight: "700", fontVariant: ["tabular-nums"] },
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 16 },
  sectionTitle: { fontSize: 15, fontWeight: "700" },
  empty: { alignItems: "center", paddingVertical: 24, gap: 8 },
  emptyText: { fontSize: 13 },
  alertRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12, borderBottomWidth: 1 },
  alertAvatar: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  alertUser: { fontSize: 13, fontWeight: "700" },
  alertMeta: { fontSize: 11, marginTop: 2 },
  alertConf: { fontSize: 14, fontWeight: "800" },
  tipRow: { flexDirection: "row", gap: 10, paddingVertical: 10, borderBottomWidth: 1 },
  tipIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  tipTitle: { fontSize: 13, fontWeight: "700" },
  tipDesc: { fontSize: 11, marginTop: 2 },
});
