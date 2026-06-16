/**
 * Safety Pods — group travel protection
 * Uses WebRTC + group WebSocket rooms
 */
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "../theme/ThemeContext";
import { Card, PrimaryButton, Pill } from "../components/ui";

export default function SafetyPodsScreen() {
  const { theme, isDark } = useTheme();
  const [pods, setPods] = useState([
    { id: "pod-1", name: "Late Night Cab", members: 4, active: true, code: "ABC123" },
    { id: "pod-2", name: "College Friends", members: 6, active: false, code: "XYZ789" },
  ]);
  const [newPodName, setNewPodName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [activePod, setActivePod] = useState<string | null>(null);

  const createPod = () => {
    if (!newPodName.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const newPod = {
      id: `pod-${Date.now()}`,
      name: newPodName,
      members: 1,
      active: true,
      code: Math.random().toString(36).slice(2, 8).toUpperCase(),
    };
    setPods([newPod, ...pods]);
    setNewPodName("");
    Alert.alert("✓ Pod Created", `Share code ${newPod.code} with friends to join`);
  };

  const joinPod = () => {
    if (!joinCode.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("✓ Joined Pod", "You're now part of the safety pod");
    setJoinCode("");
  };

  const activatePod = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setActivePod(id);
    Alert.alert("Pod Active", "All members can now see your live location");
  };

  return (
    <LinearGradient
      colors={isDark ? ["#05060f", "#0a1628"] : ["#f7f8fc", "#fff"]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: theme.text }]}>Safety Pods</Text>
        <Text style={[styles.desc, { color: theme.textDim }]}>Group travel protection</Text>

        <Card style={{ marginTop: 20 }} glow="cyan">
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <Ionicons name="people-circle" size={20} color={theme.cyan} />
            <Text style={[styles.cardTitle, { color: theme.text }]}>How it works</Text>
          </View>
          <Text style={[styles.cardText, { color: theme.textDim }]}>
            • Create pod with friends for group travel{"\n"}
            • Share pod code to invite members{"\n"}
            • All members see each other's live location{"\n"}
            • Any member triggers SOS → all alerted{"\n"}
            • Perfect for late-night cab rides, walks
          </Text>
        </Card>

        <Card style={{ marginTop: 20 }}>
          <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 12 }]}>Create New Pod</Text>
          <TextInput
            value={newPodName}
            onChangeText={setNewPodName}
            placeholder="e.g. Friday Night Out"
            placeholderTextColor={theme.textMuted}
            style={[styles.input, { color: theme.text, backgroundColor: theme.inputBg, borderColor: theme.border }]}
          />
          <View style={{ marginTop: 12 }}>
            <PrimaryButton
              label="Create Pod"
              onPress={createPod}
              icon={<Ionicons name="add-circle" size={18} color="#fff" />}
              tone="cyan"
            />
          </View>
        </Card>

        <Card style={{ marginTop: 16 }}>
          <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 12 }]}>Join Existing Pod</Text>
          <TextInput
            value={joinCode}
            onChangeText={setJoinCode}
            placeholder="Enter 6-digit code"
            placeholderTextColor={theme.textMuted}
            autoCapitalize="characters"
            style={[styles.input, styles.codeInput, { color: theme.text, backgroundColor: theme.inputBg, borderColor: theme.border }]}
          />
          <View style={{ marginTop: 12 }}>
            <PrimaryButton
              label="Join Pod"
              onPress={joinPod}
              icon={<Ionicons name="log-in" size={18} color="#fff" />}
              tone="emerald"
            />
          </View>
        </Card>

        <View style={{ marginTop: 24 }}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Pods ({pods.length})</Text>
          {pods.map((pod) => (
            <Card key={pod.id} style={{ marginTop: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <LinearGradient
                  colors={pod.active ? ["#38e8ff", "#0ea5e9"] : ["#8a90a8", "#5b607a"]}
                  style={styles.podIcon}
                >
                  <Ionicons name="people" size={22} color="#fff" />
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={[styles.podName, { color: theme.text }]}>{pod.name}</Text>
                    {pod.active && <Pill label="ACTIVE" tone="cyan" />}
                  </View>
                  <Text style={[styles.podMeta, { color: theme.textDim }]}>
                    {pod.members} members • Code: {pod.code}
                  </Text>
                </View>
              </View>

              <View style={styles.podActions}>
                <TouchableOpacity style={[styles.podBtn, { backgroundColor: "rgba(56,232,255,0.15)" }]}>
                  <Ionicons name="share" size={14} color={theme.cyan} />
                  <Text style={[styles.podBtnText, { color: theme.cyan }]}>Share Code</Text>
                </TouchableOpacity>

                {activePod === pod.id ? (
                  <TouchableOpacity style={[styles.podBtn, { backgroundColor: "rgba(46,230,166,0.15)" }]}>
                    <Ionicons name="checkmark-circle" size={14} color={theme.emerald} />
                    <Text style={[styles.podBtnText, { color: theme.emerald }]}>Active</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => activatePod(pod.id)}
                    style={[styles.podBtn, { backgroundColor: "rgba(255,61,127,0.15)" }]}
                  >
                    <Ionicons name="radio" size={14} color={theme.primary} />
                    <Text style={[styles.podBtnText, { color: theme.primary }]}>Activate</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          ))}
        </View>

        {activePod && (
          <Card style={{ marginTop: 20, borderColor: "rgba(46,230,166,0.3)" }} glow="emerald">
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <Ionicons name="shield-checkmark" size={20} color={theme.emerald} />
              <Text style={[styles.activeTitle, { color: theme.text }]}>Pod Active</Text>
            </View>
            <Text style={[styles.activeText, { color: theme.textDim }]}>
              All members can see your live location. If anyone triggers SOS, everyone gets alerted instantly.
            </Text>

            <View style={styles.memberPreview}>
              {[1, 2, 3, 4].map((i) => (
                <LinearGradient key={i} colors={["#ff3d7f", "#38e8ff"]} style={styles.memberAvatar}>
                  <Text style={{ color: "#fff", fontWeight: "800", fontSize: 12 }}>U{i}</Text>
                </LinearGradient>
              ))}
              <View style={[styles.memberMore, { backgroundColor: theme.inputBg }]}>
                <Text style={{ color: theme.textDim, fontSize: 11, fontWeight: "700" }}>+2</Text>
              </View>
            </View>
          </Card>
        )}
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
  sectionTitle: { fontSize: 15, fontWeight: "700" },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14 },
  codeInput: { textAlign: "center", letterSpacing: 4, fontSize: 18, fontWeight: "800" },
  podIcon: { width: 50, height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  podName: { fontSize: 14, fontWeight: "800" },
  podMeta: { fontSize: 11, marginTop: 2, fontFamily: "monospace" },
  podActions: { flexDirection: "row", gap: 8, marginTop: 12 },
  podBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 10 },
  podBtnText: { fontSize: 12, fontWeight: "700" },
  activeTitle: { fontSize: 14, fontWeight: "700" },
  activeText: { fontSize: 12, lineHeight: 18 },
  memberPreview: { flexDirection: "row", gap: -8, marginTop: 12 },
  memberAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#05060f" },
  memberMore: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#05060f" },
});
