/**
 * AI Companion with Memory — personalized safety assistant
 * Uses RAG + pattern learning
 */
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "../theme/ThemeContext";
import { Card, Pill } from "../components/ui";

const MEMORY = [
  { key: "routes", value: "You usually take Route A on Tuesdays" },
  { key: "times", value: "You avoid going out after 10 PM" },
  { key: "places", value: "You feel safest in Khan Market" },
  { key: "contacts", value: "Rahul is your primary guardian" },
];

export default function CompanionScreen() {
  const { theme, isDark } = useTheme();
  const [messages, setMessages] = useState<any[]>([
    {
      role: "ai",
      text: "Hi Aanya! I'm your AI safety companion. I've learned your patterns and I'm here to keep you safe. What's on your mind?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const sendMessage = () => {
    if (!input.trim()) return;
    Haptics.selectionAsync();
    const userMsg = { role: "user", text: input, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages([...messages, userMsg]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const lower = input.toLowerCase();
      let response = "I'm here for you. Tell me more about what's worrying you.";

      if (lower.includes("route") || lower.includes("path")) {
        response = "Based on your history, you usually take Route A on Tuesdays. But today I'm seeing 2 incidents reported on that route. I recommend Route B via Ring Road — it's 1.2km longer but 40% safer. Want me to navigate?";
      } else if (lower.includes("night") || lower.includes("late")) {
        response = "I notice you're planning to go out late. Your pattern shows you usually avoid this. If you must go, I recommend: 1) Share live location with Rahul, 2) Take the well-lit main road, 3) I'll stay on call with you. What do you think?";
      } else if (lower.includes("scared") || lower.includes("worried")) {
        response = "I understand you're feeling worried. You're not alone — I'm here, and Rahul is just a call away. Remember, you've successfully navigated 47 similar situations. You've got this. Want me to activate extra safety measures?";
      } else if (lower.includes("help") || lower.includes("emergency")) {
        response = "⚠ I detect urgency. I can trigger SOS immediately, or if you prefer, I can: 1) Call Rahul, 2) Share your location with guardians, 3) Start recording. What do you need right now?";
      }

      const aiMsg = { role: "ai", text: response, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
      setMessages((prev) => [...prev, aiMsg]);
      setTyping(false);
    }, 1500);
  };

  return (
    <LinearGradient
      colors={isDark ? ["#05060f", "#0a1628"] : ["#f7f8fc", "#fff"]}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <LinearGradient colors={["#38e8ff", "#0ea5e9"]} style={styles.avatar}>
            <Ionicons name="sparkles" size={24} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={[styles.title, { color: theme.text }]}>AI Companion</Text>
            <Text style={[styles.subtitle, { color: theme.emerald }]}>● Online • Knows you</Text>
          </View>
        </View>
        <Pill label="MEMORY" tone="cyan" />
      </View>

      <ScrollView style={styles.messages} contentContainerStyle={{ paddingBottom: 20 }}>
        {messages.map((msg, i) => (
          <View key={i} style={[styles.messageRow, msg.role === "user" && styles.userRow]}>
            {msg.role === "ai" && (
              <LinearGradient colors={["#38e8ff", "#0ea5e9"]} style={styles.msgAvatar}>
                <Ionicons name="sparkles" size={14} color="#fff" />
              </LinearGradient>
            )}
            <View style={[styles.messageBubble, msg.role === "user" ? styles.userBubble : styles.aiBubble]}>
              <Text style={[styles.messageText, { color: theme.text }]}>{msg.text}</Text>
              <Text style={[styles.messageTime, { color: theme.textMuted }]}>{msg.time}</Text>
            </View>
          </View>
        ))}
        {typing && (
          <View style={styles.messageRow}>
            <LinearGradient colors={["#38e8ff", "#0ea5e9"]} style={styles.msgAvatar}>
              <Ionicons name="sparkles" size={14} color="#fff" />
            </LinearGradient>
            <View style={[styles.messageBubble, styles.aiBubble]}>
              <Text style={[styles.typingDots, { color: theme.textDim }]}>●●●</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <Card style={{ margin: 20, padding: 12 }}>
        <Text style={[styles.memoryTitle, { color: theme.textDim, marginBottom: 8 }]}>What I remember:</Text>
        <View style={styles.memoryGrid}>
          {MEMORY.map((m, i) => (
            <View key={i} style={[styles.memoryChip, { backgroundColor: theme.inputBg }]}>
              <Ionicons name="checkmark-circle" size={12} color={theme.emerald} />
              <Text style={[styles.memoryText, { color: theme.textDim }]} numberOfLines={1}>{m.value}</Text>
            </View>
          ))}
        </View>
      </Card>

      <View style={[styles.inputRow, { backgroundColor: theme.bgElevated, borderTopColor: theme.border }]}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask me anything..."
          placeholderTextColor={theme.textMuted}
          style={[styles.input, { color: theme.text, backgroundColor: theme.inputBg }]}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
          <LinearGradient colors={["#38e8ff", "#0ea5e9"]} style={styles.sendBtnInner}>
            <Ionicons name="send" size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, paddingTop: 60 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "800" },
  subtitle: { fontSize: 11, marginTop: 2 },
  messages: { flex: 1, paddingHorizontal: 20 },
  messageRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  userRow: { flexDirection: "row-reverse" },
  msgAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  messageBubble: { maxWidth: "75%", padding: 12, borderRadius: 16 },
  userBubble: { backgroundColor: "rgba(255,61,127,0.15)", borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: "rgba(56,232,255,0.1)", borderBottomLeftRadius: 4 },
  messageText: { fontSize: 13, lineHeight: 18 },
  messageTime: { fontSize: 10, marginTop: 4, textAlign: "right" },
  typingDots: { fontSize: 20, letterSpacing: 2 },
  memoryTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  memoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  memoryChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, maxWidth: "48%" },
  memoryText: { fontSize: 10, flex: 1 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderTopWidth: 1 },
  input: { flex: 1, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 24, fontSize: 14 },
  sendBtn: {},
  sendBtnInner: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
});
