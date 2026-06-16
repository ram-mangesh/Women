import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { useTheme } from "../theme/ThemeContext";
import { useSafetyStore, type RiskLevel } from "../store/safetyStore";
import { Card, Pill } from "../components/ui";
import SOSButton from "../components/SOSButton";

export default function SOSScreen() {
  const { theme, isDark } = useTheme();
  const { sosActive, activeAlerts, triggerSOS, dismissSOS } = useSafetyStore();
  const [fakeCall, setFakeCall] = useState<string | null>(null);
  const [stealth, setStealth] = useState("");

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const loc = await Location.getCurrentPositionAsync({});
      // Could update store here
    })();
  }, []);

  const handleSOS = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    await triggerSOS("MANUAL", 28.6139, 77.209);
  };

  const handleFakeCall = (caller: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setFakeCall(caller);
  };

  const stealthKey = (k: string) => {
    Haptics.selectionAsync();
    if (k === "C") { setStealth(""); return; }
    const next = (stealth + k).slice(-4);
    setStealth(next);
    if (next === "9999") {
      triggerSOS("STEALTH_PIN", 28.6139, 77.209);
      setStealth("");
    }
  };

  return (
    <LinearGradient
      colors={isDark ? ["#05060f", "#1a0a15"] : ["#f7f8fc", "#fff"]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: theme.text }]}>Emergency SOS</Text>
        <Text style={[styles.desc, { color: theme.textDim }]}>6 redundant ways to trigger SOS</Text>

        {/* SOS active banner */}
        {sosActive && (
          <Card style={styles.banner} glow="pink">
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <View style={[styles.blink, { backgroundColor: theme.primary }]} />
              <Text style={[styles.bannerTitle, { color: theme.primary }]}>SOS ACTIVE</Text>
            </View>
            <Text style={[styles.bannerText, { color: theme.text }]}>
              Your guardians have been alerted. Live GPS, hidden audio, and video recording are streaming.
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
              <Pill label="SMS × 4" tone="pink" />
              <Pill label="WhatsApp" tone="cyan" />
              <Pill label="Recording" tone="emerald" />
              <Pill label="Flashlight" tone="amber" />
            </View>
            <TouchableOpacity onPress={dismissSOS} style={styles.disarmBtn}>
              <Text style={[styles.disarmText, { color: theme.textDim }]}>False alarm — Disarm</Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* Big SOS button */}
        <View style={styles.sosWrap}>
          <SOSButton onPress={sosActive ? dismissSOS : handleSOS} active={sosActive} />
          <Text style={[styles.sosHint, { color: theme.textDim }]}>
            {sosActive ? "Tap to disarm" : "Hold for 0.8s to trigger"}
          </Text>
        </View>

        {/* Trigger methods */}
        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 16 }]}>Trigger Methods</Text>
        <View style={styles.triggerGrid}>
          {[
            { icon: "mic", label: "Voice", sub: "Say HELP" },
            { icon: "phone-portrait", label: "Shake", sub: "Accelerometer" },
            { icon: "watch", label: "Watch", sub: "Heart spike" },
            { icon: "calculator", label: "Stealth", sub: "PIN 9999" },
            { icon: "volume-high", label: "Volume", sub: "Triple press" },
            { icon: "happy", label: "Emotion", sub: "Panic AI" },
          ].map((t, i) => (
            <TouchableOpacity
              key={i}
              onPress={handleSOS}
              style={[styles.triggerCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
            >
              <View style={[styles.triggerIcon, { backgroundColor: "rgba(255,61,127,0.15)" }]}>
                <Ionicons name={t.icon as any} size={20} color={theme.primary} />
              </View>
              <Text style={[styles.triggerLabel, { color: theme.text }]}>{t.label}</Text>
              <Text style={[styles.triggerSub, { color: theme.textDim }]}>{t.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Fake call */}
        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 20 }]}>Fake Call Escape</Text>
        <Card>
          <Text style={[styles.cardDesc, { color: theme.textDim }]}>Realistic ringtone to exit uncomfortable situations</Text>
          <View style={styles.fakeRow}>
            {["Mom", "Brother", "Police", "Unknown"].map((c) => (
              <TouchableOpacity key={c} onPress={() => handleFakeCall(c)} style={styles.fakeBtn}>
                <Ionicons name="call" size={16} color={theme.cyan} />
                <Text style={[styles.fakeText, { color: theme.text }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {fakeCall && (
            <Card style={{ marginTop: 12, borderColor: theme.emerald }}>
              <Text style={{ fontSize: 10, color: theme.emerald, letterSpacing: 2 }}>INCOMING CALL</Text>
              <Text style={[styles.fakeCaller, { color: theme.text }]}>{fakeCall}</Text>
              <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
                <TouchableOpacity onPress={() => setFakeCall(null)}
                  style={[styles.fakeAction, { backgroundColor: "rgba(46,230,166,0.2)" }]}>
                  <Text style={{ color: theme.emerald, fontWeight: "700" }}>Answer</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setFakeCall(null)}
                  style={[styles.fakeAction, { backgroundColor: "rgba(255,61,127,0.2)" }]}>
                  <Text style={{ color: theme.primary, fontWeight: "700" }}>Decline</Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}
        </Card>

        {/* Stealth calculator */}
        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 20 }]}>Stealth Calculator</Text>
        <Card>
          <Text style={[styles.cardDesc, { color: theme.textDim }]}>
            Enter <Text style={{ color: theme.amber, fontWeight: "700" }}>9999</Text> to trigger silent SOS
          </Text>
          <View style={[styles.calcDisplay, { backgroundColor: theme.inputBg }]}>
            <Text style={[styles.calcText, { color: theme.text }]}>{stealth || "0"}</Text>
          </View>
          <View style={styles.calcGrid}>
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "="].map((k) => (
              <TouchableOpacity key={k} onPress={() => stealthKey(k)} style={styles.calcBtn}>
                <Text style={[styles.calcBtnText, { color: theme.text }]}>{k}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingTop: 60, paddingBottom: 100 },
  title: { fontSize: 26, fontWeight: "800" },
  desc: { fontSize: 13, color: "#8a90a8", marginTop: 4 },
  banner: { marginTop: 16, borderColor: "rgba(255,61,127,0.4)" },
  blink: { width: 8, height: 8, borderRadius: 4 },
  bannerTitle: { fontSize: 12, fontWeight: "800", letterSpacing: 2 },
  bannerText: { fontSize: 13, lineHeight: 18 },
  disarmBtn: { marginTop: 12, alignItems: "center", paddingVertical: 8 },
  disarmText: { fontSize: 12 },
  sosWrap: { alignItems: "center", marginTop: 24 },
  sosHint: { fontSize: 12, marginTop: 16 },
  sectionTitle: { fontSize: 15, fontWeight: "700" },
  triggerGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 },
  triggerCard: { width: "30%", padding: 12, borderRadius: 14, borderWidth: 1, alignItems: "center" },
  triggerIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  triggerLabel: { fontSize: 12, fontWeight: "700" },
  triggerSub: { fontSize: 10, marginTop: 2 },
  cardDesc: { fontSize: 12, marginBottom: 12 },
  fakeRow: { flexDirection: "row", gap: 8 },
  fakeBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 10, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.05)" },
  fakeText: { fontSize: 12, fontWeight: "600" },
  fakeCaller: { fontSize: 22, fontWeight: "800", marginTop: 4 },
  fakeAction: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  calcDisplay: { padding: 14, borderRadius: 12, alignItems: "flex-end", marginBottom: 10, minHeight: 56, justifyContent: "center" },
  calcText: { fontSize: 24, fontFamily: "monospace" },
  calcGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  calcBtn: { width: "23%", paddingVertical: 12, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center" },
  calcBtnText: { fontSize: 15, fontWeight: "600" },
});
