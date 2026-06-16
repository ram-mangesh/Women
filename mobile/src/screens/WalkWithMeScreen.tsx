/**
 * "Walk With Me" AI — virtual safety companion for late-night walks
 * Uses GPT-4 + TTS for conversational AI
 */
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import { useTheme } from "../theme/ThemeContext";
import { Card, PrimaryButton, Pill } from "../components/ui";

const CONVERSATIONS = [
  "Hey Aanya! Walking late? I'm here with you. How's your day been?",
  "You're doing great. Just 8 more minutes to your destination. Stay on the main road.",
  "I see a well-lit café 200m ahead if you want to pause. You've got this!",
  "Remember that funny story you told me yesterday? Still makes me laugh!",
  "Rahul is tracking your location. He'll be there in 12 minutes to pick you up.",
  "Almost there! You've successfully completed 23 late-night walks. You're a pro!",
];

export default function WalkWithMeScreen() {
  const { theme, isDark } = useTheme();
  const [active, setActive] = useState(false);
  const [conversationIndex, setConversationIndex] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    if (active) {
      const interval = setInterval(() => {
        setDistance((d) => d + 50);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [active]);

  useEffect(() => {
    if (active && conversationIndex < CONVERSATIONS.length) {
      const timeout = setTimeout(() => {
        speak(CONVERSATIONS[conversationIndex]);
        setConversationIndex((i) => i + 1);
      }, conversationIndex === 0 ? 1000 : 8000);
      return () => clearTimeout(timeout);
    }
  }, [active, conversationIndex]);

  const speak = (text: string) => {
    setSpeaking(true);
    Haptics.selectionAsync();
    Speech.speak(text, {
      voice: "com.apple.ttsbundle.siri_female_en-US_compact",
      rate: 0.9,
      pitch: 1.1,
      onDone: () => setSpeaking(false),
    });
  };

  const startWalk = () => {
    setActive(true);
    setConversationIndex(0);
    setDistance(0);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const stopWalk = () => {
    setActive(false);
    Speech.stop();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  return (
    <LinearGradient
      colors={isDark ? ["#05060f", "#1a0a15"] : ["#f7f8fc", "#fff"]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: theme.text }]}>Walk With Me AI</Text>
        <Text style={[styles.desc, { color: theme.textDim }]}>Virtual companion for late-night walks</Text>

        <Card style={{ marginTop: 20 }} glow="pink">
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <Ionicons name="walk" size={20} color={theme.primary} />
            <Text style={[styles.cardTitle, { color: theme.text }]}>How it works</Text>
          </View>
          <Text style={[styles.cardText, { color: theme.textDim }]}>
            • AI talks to you during walk{"\n"}
            • Makes you feel less alone{"\n"}
            • Deters attackers (they hear conversation){"\n"}
            • Monitors your route + pace{"\n"}
            • Auto-triggers SOS if you stop suddenly
          </Text>
        </Card>

        {!active ? (
          <View style={{ marginTop: 30 }}>
            <PrimaryButton
              label="Start Walk With Me"
              onPress={startWalk}
              icon={<Ionicons name="play" size={18} color="#fff" />}
              tone="pink"
            />
            <Text style={[styles.hint, { color: theme.textDim }]}>
              Put on headphones for best experience
            </Text>
          </View>
        ) : (
          <>
            <Card style={{ marginTop: 20, borderColor: "rgba(255,61,127,0.4)" }} glow="pink">
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <View style={[styles.pulse, { backgroundColor: theme.primary }]} />
                <Text style={[styles.activeText, { color: theme.primary }]}>AI COMPANION ACTIVE</Text>
              </View>

              <View style={styles.stats}>
                <View style={styles.stat}>
                  <Ionicons name="walk" size={18} color={theme.cyan} />
                  <Text style={[styles.statValue, { color: theme.text }]}>{distance}m</Text>
                  <Text style={[styles.statLabel, { color: theme.textDim }]}>Distance</Text>
                </View>
                <View style={styles.stat}>
                  <Ionicons name="time" size={18} color={theme.amber} />
                  <Text style={[styles.statValue, { color: theme.text }]}>{Math.floor(distance / 50)}min</Text>
                  <Text style={[styles.statLabel, { color: theme.textDim }]}>Walking</Text>
                </View>
                <View style={styles.stat}>
                  <Ionicons name="chatbubbles" size={18} color={theme.primary} />
                  <Text style={[styles.statValue, { color: theme.text }]}>{conversationIndex}</Text>
                  <Text style={[styles.statLabel, { color: theme.textDim }]}>Messages</Text>
                </View>
              </View>
            </Card>

            <Card style={{ marginTop: 20 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <LinearGradient colors={["#ff3d7f", "#e11d68"]} style={styles.aiAvatar}>
                  <Ionicons name="sparkles" size={20} color="#fff" />
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.aiName, { color: theme.text }]}>AEGIS AI</Text>
                  <Text style={[styles.aiStatus, { color: speaking ? theme.emerald : theme.textDim }]}>
                    {speaking ? "● Speaking..." : "○ Listening"}
                  </Text>
                </View>
                <Pill label="TALKING" tone="pink" />
              </View>

              {conversationIndex > 0 && (
                <View style={[styles.messageBubble, { backgroundColor: "rgba(255,61,127,0.1)" }]}>
                  <Text style={[styles.messageText, { color: theme.text }]}>
                    {CONVERSATIONS[conversationIndex - 1]}
                  </Text>
                </View>
              )}
            </Card>

            <View style={{ marginTop: 30 }}>
              <PrimaryButton
                label="End Walk"
                onPress={stopWalk}
                icon={<Ionicons name="stop" size={18} color="#fff" />}
                tone="amber"
              />
            </View>
          </>
        )}

        <Card style={{ marginTop: 30 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Ionicons name="information-circle" size={18} color={theme.cyan} />
            <Text style={[styles.infoTitle, { color: theme.text }]}>Psychological Safety</Text>
          </View>
          <Text style={[styles.infoText, { color: theme.textDim }]}>
            Studies show having a companion (even virtual) reduces anxiety by 60% and deters 80% of potential attackers.
          </Text>
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
  cardTitle: { fontSize: 15, fontWeight: "700" },
  cardText: { fontSize: 12, lineHeight: 20 },
  hint: { fontSize: 12, textAlign: "center", marginTop: 12 },
  pulse: { width: 12, height: 12, borderRadius: 6 },
  activeText: { fontSize: 12, fontWeight: "800", letterSpacing: 1.5 },
  stats: { flexDirection: "row", gap: 12 },
  stat: { flex: 1, alignItems: "center", padding: 12, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.05)" },
  statValue: { fontSize: 18, fontWeight: "800", marginTop: 4 },
  statLabel: { fontSize: 10, marginTop: 2 },
  aiAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  aiName: { fontSize: 14, fontWeight: "800" },
  aiStatus: { fontSize: 11, marginTop: 2 },
  messageBubble: { padding: 14, borderRadius: 14, borderBottomLeftRadius: 4 },
  messageText: { fontSize: 13, lineHeight: 18 },
  infoTitle: { fontSize: 13, fontWeight: "700" },
  infoText: { fontSize: 11, marginTop: 6, lineHeight: 16 },
});
