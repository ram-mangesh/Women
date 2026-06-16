import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { useSafetyStore } from "../store/safetyStore";
import { Card, StatCard, Pill } from "../components/ui";

export default function TrackingScreen() {
  const { theme, isDark } = useTheme();
  const { liveTracking, battery, heartbeat, tick } = useSafetyStore();

  useEffect(() => {
    const id = setInterval(tick, 1500);
    return () => clearInterval(id);
  }, [tick]);

  const waypoints = [
    { time: "18:42", text: "Journey started from Home", tone: "emerald" as const },
    { time: "18:47", text: "Entered safe zone • Khan Market", tone: "cyan" as const },
    { time: "18:52", text: "AI reroute suggested", tone: "amber" as const },
    { time: "18:56", text: "Passed low-light stretch", tone: "cyan" as const },
    { time: "now", text: "On route • ETA 14 min", tone: "pink" as const },
  ];

  return (
    <LinearGradient
      colors={isDark ? ["#05060f", "#0a1628"] : ["#f7f8fc", "#ffffff"]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: theme.text }]}>Live Tracking</Text>
        <Text style={[styles.desc, { color: theme.textDim }]}>Guardian-visible encrypted journey</Text>

        {/* Map placeholder */}
        <Card style={[styles.mapCard, { overflow: "hidden" }]} glow="cyan">
          <LinearGradient
            colors={isDark ? ["#0a1628", "#1a2847"] : ["#e8f0f8", "#c9dbec"]}
            style={styles.mapGradient}
          >
            {/* Grid pattern */}
            <View style={styles.gridOverlay} />
            {/* Path dots */}
            {Array.from({ length: 8 }).map((_, i) => (
              <View key={i} style={[styles.pathDot, {
                left: 20 + i * 35,
                top: 80 + Math.sin(i) * 30,
                backgroundColor: i === 7 ? theme.primary : theme.cyan,
                transform: [{ scale: i === 7 ? 1.3 : 1 }],
              }]} />
            ))}
            {/* Current location */}
            <View style={[styles.currentLoc, { borderColor: theme.primary }]}>
              <View style={[styles.currentDot, { backgroundColor: theme.primary }]} />
            </View>
            <Text style={[styles.mapLabel, { color: isDark ? "#fff" : "#0f172a" }]}>📍 Live Map</Text>
          </LinearGradient>
          <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 14 }}>
            <View>
              <Text style={{ fontSize: 11, color: theme.textDim }}>ROUTE</Text>
              <Text style={{ fontSize: 13, fontWeight: "700", color: theme.text }}>Home → Connaught Place</Text>
            </View>
            <Pill label="ENCRYPTED" tone="emerald" />
          </View>
        </Card>

        {/* Stats */}
        <View style={styles.statGrid}>
          <StatCard label="ETA" value={`${liveTracking.eta}m`} tone="cyan" />
          <StatCard label="Speed" value="4.2" hint="km/h" tone="emerald" />
          <StatCard label="Battery" value={`${battery}%`} tone="violet" />
          <StatCard label="Heart" value={Math.round(heartbeat)} tone="pink" />
        </View>

        {/* Guardians watching */}
        <Card style={{ marginTop: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Ionicons name="shield-checkmark" size={18} color={theme.emerald} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Guardians Watching</Text>
          </View>
          {[
            { name: "Rahul Sharma", rel: "Brother", eta: "Watching now", online: true },
            { name: "Sneha Kapoor", rel: "Best Friend", eta: "Last seen 2m ago", online: true },
            { name: "Mom • Sunita", rel: "Mother", eta: "Offline", online: false },
          ].map((g, i) => (
            <View key={i} style={[styles.guardianRow, { borderBottomColor: theme.border }]}>
              <LinearGradient colors={["#ff3d7f", "#38e8ff"]} style={styles.avatar}>
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>
                  {g.name.split(" ").map((s) => s[0]).join("").slice(0, 2)}
                </Text>
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={[styles.guardianName, { color: theme.text }]}>{g.name}</Text>
                <Text style={[styles.guardianRel, { color: theme.textDim }]}>{g.rel} • {g.eta}</Text>
              </View>
              <View style={[styles.onlineDot, { backgroundColor: g.online ? theme.emerald : theme.textMuted }]} />
            </View>
          ))}
        </Card>

        {/* Timeline */}
        <Card style={{ marginTop: 16 }}>
          <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 12 }]}>Journey Timeline</Text>
          {waypoints.map((w, i) => {
            const colors: any = {
              pink: theme.primary, amber: theme.amber, cyan: theme.cyan, emerald: theme.emerald,
            };
            return (
              <View key={i} style={{ flexDirection: "row", gap: 10, marginBottom: 14 }}>
                <View style={{ alignItems: "center" }}>
                  <View style={[styles.timelineDot, { backgroundColor: colors[w.tone] }]} />
                  {i < waypoints.length - 1 && <View style={[styles.timelineLine, { backgroundColor: theme.border }]} />}
                </View>
                <View style={{ flex: 1, paddingBottom: 6 }}>
                  <Text style={[styles.timelineTime, { color: theme.textMuted }]}>{w.time}</Text>
                  <Text style={[styles.timelineText, { color: theme.text }]}>{w.text}</Text>
                </View>
              </View>
            );
          })}
        </Card>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingTop: 60, paddingBottom: 100 },
  title: { fontSize: 26, fontWeight: "800" },
  desc: { fontSize: 13, marginTop: 4 },
  mapCard: { marginTop: 16 },
  mapGradient: { height: 220, position: "relative" },
  gridOverlay: {
    position: "absolute", inset: 0,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.05)",
  },
  pathDot: { position: "absolute", width: 10, height: 10, borderRadius: 5 },
  currentLoc: { position: "absolute", right: 30, top: 40, width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,61,127,0.2)" },
  currentDot: { width: 10, height: 10, borderRadius: 5 },
  mapLabel: { position: "absolute", bottom: 10, left: 14, fontSize: 12, fontWeight: "700" },
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 16 },
  sectionTitle: { fontSize: 15, fontWeight: "700" },
  guardianRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderBottomWidth: 1 },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  guardianName: { fontSize: 13, fontWeight: "700" },
  guardianRel: { fontSize: 11, marginTop: 2 },
  onlineDot: { width: 8, height: 8, borderRadius: 4 },
  timelineDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  timelineLine: { width: 1, flex: 1, marginTop: 4, minHeight: 24 },
  timelineTime: { fontSize: 10, fontWeight: "600" },
  timelineText: { fontSize: 13, marginTop: 2 },
});
