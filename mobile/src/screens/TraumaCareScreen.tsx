/**
 * Post-Incident Trauma Care — guided healing after SOS
 * Uses CBT AI + breathing exercises + therapist matching
 */
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "../theme/ThemeContext";
import { Card, PrimaryButton, Pill } from "../components/ui";

const BREATHING_PHASES = [
  { name: "Breathe In", duration: 4, color: "#38e8ff" },
  { name: "Hold", duration: 4, color: "#ffb020" },
  { name: "Breathe Out", duration: 6, color: "#2ee6a6" },
];

const GROUNDING = [
  "5 things you can SEE right now",
  "4 things you can TOUCH",
  "3 things you can HEAR",
  "2 things you can SMELL",
  "1 thing you can TASTE",
];

export default function TraumaCareScreen() {
  const { theme, isDark } = useTheme();
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState(0);
  const [breathCount, setBreathCount] = useState(0);
  const [groundingStep, setGroundingStep] = useState(0);
  const [mood, setMood] = useState<number | null>(null);

  useEffect(() => {
    if (breathingActive) {
      const phase = BREATHING_PHASES[breathPhase];
      const timeout = setTimeout(() => {
        setBreathPhase((p) => (p + 1) % 3);
        if (breathPhase === 2) setBreathCount((c) => c + 1);
      }, phase.duration * 1000);
      return () => clearTimeout(timeout);
    }
  }, [breathingActive, breathPhase]);

  const startBreathing = () => {
    setBreathingActive(true);
    setBreathPhase(0);
    setBreathCount(0);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const stopBreathing = () => {
    setBreathingActive(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  return (
    <LinearGradient
      colors={isDark ? ["#05060f", "#0a1628"] : ["#f7f8fc", "#fff"]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: theme.text }]}>Post-Incident Care</Text>
        <Text style={[styles.desc, { color: theme.textDim }]}>Trauma healing & support</Text>

        <Card style={{ marginTop: 20, borderColor: "rgba(56,232,255,0.3)" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <Ionicons name="heart" size={20} color={theme.cyan} />
            <Text style={[styles.cardTitle, { color: theme.text }]}>You're safe now</Text>
          </View>
          <Text style={[styles.cardText, { color: theme.textDim }]}>
            It's normal to feel shaken after an incident. Take your time. We're here to help you heal — one breath at a time.
          </Text>
        </Card>

        {/* Mood check */}
        <Card style={{ marginTop: 20 }}>
          <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 12 }]}>How are you feeling?</Text>
          <View style={styles.moodRow}>
            {[
              { emoji: "😰", label: "Anxious", value: 1 },
              { emoji: "😢", label: "Sad", value: 2 },
              { emoji: "😐", label: "Numb", value: 3 },
              { emoji: "🙂", label: "Okay", value: 4 },
              { emoji: "😊", label: "Better", value: 5 },
            ].map((m) => (
              <TouchableOpacity
                key={m.value}
                onPress={() => { setMood(m.value); Haptics.selectionAsync(); }}
                style={[styles.moodBtn, mood === m.value && { backgroundColor: "rgba(56,232,255,0.2)", borderColor: theme.cyan }]}
              >
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                <Text style={[styles.moodLabel, { color: mood === m.value ? theme.cyan : theme.textDim }]}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Breathing exercise */}
        <Card style={{ marginTop: 20 }}>
          <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 12 }]}>
            <Ionicons name="leaf" size={18} color={theme.emerald} /> 4-4-6 Breathing
          </Text>

          {!breathingActive ? (
            <>
              <Text style={[styles.helperText, { color: theme.textDim }]}>
                Calms your nervous system in 2-3 minutes. Follow the circle.
              </Text>
              <PrimaryButton
                label="Start Breathing"
                onPress={startBreathing}
                icon={<Ionicons name="play" size={18} color="#fff" />}
                tone="cyan"
              />
            </>
          ) : (
            <View style={{ alignItems: "center" }}>
              <View style={[styles.breathCircle, {
                borderColor: BREATHING_PHASES[breathPhase].color,
                transform: [{ scale: breathPhase === 0 ? 1.2 : breathPhase === 2 ? 0.8 : 1 }],
              }]}>
                <Text style={[styles.breathText, { color: BREATHING_PHASES[breathPhase].color }]}>
                  {BREATHING_PHASES[breathPhase].name}
                </Text>
              </View>
              <Text style={[styles.breathCount, { color: theme.text }]}>Cycle {breathCount + 1}</Text>
              <TouchableOpacity onPress={stopBreathing} style={{ marginTop: 16 }}>
                <Text style={[styles.stopText, { color: theme.primary }]}>Stop</Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>

        {/* 5-4-3-2-1 grounding */}
        <Card style={{ marginTop: 20 }}>
          <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 12 }]}>
            <Ionicons name="earth" size={18} color={theme.amber} /> 5-4-3-2-1 Grounding
          </Text>
          <Text style={[styles.helperText, { color: theme.textDim }]}>
            Brings you back to the present moment.
          </Text>

          <View style={styles.groundingList}>
            {GROUNDING.map((g, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => { setGroundingStep(i + 1); Haptics.selectionAsync(); }}
                style={[styles.groundingItem, {
                  backgroundColor: i < groundingStep ? "rgba(46,230,166,0.1)" : theme.inputBg,
                  borderColor: i < groundingStep ? theme.emerald : theme.border,
                }]}
              >
                <Ionicons
                  name={i < groundingStep ? "checkmark-circle" : "ellipse-outline"}
                  size={20}
                  color={i < groundingStep ? theme.emerald : theme.textMuted}
                />
                <Text style={[styles.groundingText, { color: i < groundingStep ? theme.text : theme.textDim }]}>
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Therapist connect */}
        <Card style={{ marginTop: 20 }} glow="emerald">
          <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 12 }]}>
            <Ionicons name="people" size={18} color={theme.emerald} /> Professional Support
          </Text>
          <Text style={[styles.helperText, { color: theme.textDim }]}>
            Connect with trauma-informed therapists (free for AEGIS users)
          </Text>

          <View style={styles.therapistList}>
            {[
              { name: "Dr. Priya Mehta", spec: "Trauma & PTSD", avail: "Available now", rating: 4.9 },
              { name: "Dr. Arjun Kapoor", spec: "Anxiety Specialist", avail: "In 30 min", rating: 4.8 },
              { name: "Dr. Sneha Reddy", spec: "EMDR Therapy", avail: "Tomorrow", rating: 4.9 },
            ].map((t, i) => (
              <View key={i} style={[styles.therapistRow, { borderBottomColor: theme.border }]}>
                <LinearGradient colors={["#2ee6a6", "#10b981"]} style={styles.therapistAvatar}>
                  <Text style={{ color: "#fff", fontWeight: "800", fontSize: 12 }}>
                    {t.name.split(" ").slice(1).map((s) => s[0]).join("")}
                  </Text>
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.therapistName, { color: theme.text }]}>{t.name}</Text>
                  <Text style={[styles.therapistSpec, { color: theme.textDim }]}>{t.spec} • ⭐ {t.rating}</Text>
                  <Text style={[styles.therapistAvail, { color: theme.emerald }]}>{t.avail}</Text>
                </View>
                <TouchableOpacity style={styles.callBtn}>
                  <Ionicons name="videocam" size={20} color={theme.emerald} />
                </TouchableOpacity>
              </View>
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
  desc: { fontSize: 13, marginTop: 4 },
  cardTitle: { fontSize: 16, fontWeight: "800" },
  cardText: { fontSize: 13, lineHeight: 20 },
  sectionTitle: { fontSize: 15, fontWeight: "700" },
  helperText: { fontSize: 12, marginBottom: 12 },
  moodRow: { flexDirection: "row", justifyContent: "space-between" },
  moodBtn: { padding: 10, borderRadius: 12, borderWidth: 1, borderColor: "transparent", alignItems: "center", minWidth: 56 },
  moodEmoji: { fontSize: 28 },
  moodLabel: { fontSize: 10, marginTop: 4, fontWeight: "600" },
  breathCircle: {
    width: 160, height: 160, borderRadius: 80,
    borderWidth: 4, alignItems: "center", justifyContent: "center",
  },
  breathText: { fontSize: 16, fontWeight: "800" },
  breathCount: { fontSize: 13, marginTop: 16, fontWeight: "600" },
  stopText: { fontSize: 13, fontWeight: "700" },
  groundingList: { gap: 8 },
  groundingItem: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 10, borderWidth: 1 },
  groundingText: { fontSize: 13, flex: 1 },
  therapistList: { gap: 4 },
  therapistRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderBottomWidth: 1 },
  therapistAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  therapistName: { fontSize: 13, fontWeight: "700" },
  therapistSpec: { fontSize: 11, marginTop: 2 },
  therapistAvail: { fontSize: 10, marginTop: 2, fontWeight: "600" },
  callBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(46,230,166,0.15)", alignItems: "center", justifyContent: "center" },
});
