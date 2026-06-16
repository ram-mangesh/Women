import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { Card, Pill } from "../components/ui";

const FEATURES = [
  { id: "Deepfake", icon: "mic-off", title: "Deepfake Voice Defender", desc: "Detect AI-cloned voice scams", tone: "pink", ai: "Wav2Vec2" },
  { id: "Companion", icon: "sparkles", title: "AI Companion Memory", desc: "Personal AI that knows you", tone: "cyan", ai: "RAG + LLM" },
  { id: "Stalker", icon: "eye-off", title: "Digital Stalker Detector", desc: "Find AirTags & spyware", tone: "amber", ai: "BLE Analysis" },
  { id: "MeshSOS", icon: "radio", title: "Mesh Network SOS", desc: "Offline SOS via Bluetooth", tone: "pink", ai: "Multi-hop" },
  { id: "SafetyPods", icon: "people-circle", title: "Safety Pods", desc: "Group travel protection", tone: "cyan", ai: "WebRTC" },
  { id: "Bystander", icon: "hand-left", title: "Bystander Beacon", desc: "Alert nearby helpers", tone: "amber", ai: "BLE Mesh" },
  { id: "Blockchain", icon: "cube", title: "Blockchain Evidence", desc: "Court-admissible chain", tone: "pink", ai: "SHA-256" },
  { id: "Biometric", icon: "finger-print", title: "Biometric Panic", desc: "Duress fingerprint SOS", tone: "cyan", ai: "WebAuthn" },
  { id: "Wearables", icon: "watch", title: "Smart Jewelry Hub", desc: "Ring, necklace, watch SOS", tone: "amber", ai: "BLE GATT" },
  { id: "WalkWithMe", icon: "walk", title: "Walk With Me AI", desc: "Virtual safety companion", tone: "pink", ai: "GPT-4 + TTS" },
  { id: "TraumaCare", icon: "heart", title: "Post-Incident Care", desc: "Trauma healing + therapy", tone: "cyan", ai: "CBT AI" },
  { id: "LegalAid", icon: "scale", title: "One-Tap Legal Aid", desc: "Auto-FIR + lawyer match", tone: "amber", ai: "LLM" },
];

export default function FeaturesScreen({ navigation }: any) {
  const { theme, isDark } = useTheme();

  const colors: any = {
    pink: { grad: ["#ff3d7f", "#e11d68"], bg: "rgba(255,61,127,0.15)", text: "#ff7aa8" },
    cyan: { grad: ["#38e8ff", "#0ea5e9"], bg: "rgba(56,232,255,0.15)", text: "#38e8ff" },
    amber: { grad: ["#ffb020", "#f59e0b"], bg: "rgba(255,176,32,0.15)", text: "#ffb020" },
  };

  return (
    <LinearGradient
      colors={isDark ? ["#05060f", "#0a0d1f"] : ["#f7f8fc", "#ffffff"]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Next-Gen Features</Text>
          <Text style={[styles.subtitle, { color: theme.textDim }]}>12 AI-powered innovations</Text>
          <View style={{ flexDirection: "row", gap: 6, marginTop: 10 }}>
            <Pill label="12 FEATURES" tone="pink" />
            <Pill label="AI/ML POWERED" tone="cyan" />
            <Pill label="UNIQUE" tone="amber" />
          </View>
        </View>

        <View style={styles.grid}>
          {FEATURES.map((f) => {
            const c = colors[f.tone];
            return (
              <TouchableOpacity
                key={f.id}
                onPress={() => navigation.navigate(f.id)}
                activeOpacity={0.8}
                style={{ width: "48%" }}
              >
                <Card style={[styles.featureCard, { borderColor: c.bg }]}>
                  <LinearGradient colors={c.grad} style={styles.iconWrap}>
                    <Ionicons name={f.icon as any} size={24} color="#fff" />
                  </LinearGradient>
                  <Text style={[styles.featureTitle, { color: theme.text }]} numberOfLines={2}>{f.title}</Text>
                  <Text style={[styles.featureDesc, { color: theme.textDim }]} numberOfLines={2}>{f.desc}</Text>
                  <View style={[styles.aiChip, { backgroundColor: c.bg }]}>
                    <Ionicons name="sparkles" size={10} color={c.text} />
                    <Text style={[styles.aiText, { color: c.text }]}>{f.ai}</Text>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })}
        </View>

        <Card style={{ marginTop: 20, borderColor: "rgba(46,230,166,0.3)" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Ionicons name="information-circle" size={20} color={theme.emerald} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoTitle, { color: theme.text }]}>All features have real AI/ML</Text>
              <Text style={[styles.infoDesc, { color: theme.textDim }]}>
                Every feature uses working models — no fake demos. FastAPI backend handles heavy ML, browser APIs handle device access.
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingTop: 60, paddingBottom: 100 },
  header: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "900" },
  subtitle: { fontSize: 13, marginTop: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 10 },
  featureCard: { padding: 14, marginBottom: 10 },
  iconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  featureTitle: { fontSize: 13, fontWeight: "800", marginBottom: 4, minHeight: 34 },
  featureDesc: { fontSize: 11, marginBottom: 10, minHeight: 28 },
  aiChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: "flex-start" },
  aiText: { fontSize: 9, fontWeight: "700", letterSpacing: 0.5 },
  infoTitle: { fontSize: 13, fontWeight: "700" },
  infoDesc: { fontSize: 11, marginTop: 2, lineHeight: 16 },
});
