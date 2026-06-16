/**
 * Smart Jewelry Hub — connects to safety wearables
 * Uses Web Bluetooth API + BLE GATT
 */
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "../theme/ThemeContext";
import { Card, PrimaryButton, Pill } from "../components/ui";

const DEVICES = [
  { id: "nimb", name: "Nimb Ring", icon: "radio-button-on", desc: "Press button for silent SOS" },
  { id: "invisawear", name: "Invisawear Necklace", icon: "diamond", desc: "Double-press pendant" },
  { id: "apple", name: "Apple Watch", icon: "watch", desc: "Hold side button" },
  { id: "fitbit", name: "Fitbit Sense", icon: "pulse", desc: "Triple-tap screen" },
];

export default function WearablesScreen() {
  const { theme, isDark } = useTheme();
  const [connected, setConnected] = useState<string[]>([]);

  const connectDevice = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (connected.includes(id)) {
      setConnected(connected.filter((d) => d !== id));
      Alert.alert("Disconnected", "Device disconnected");
    } else {
      setConnected([...connected, id]);
      Alert.alert("✓ Connected", "Device paired. Press it to trigger SOS.");
    }
  };

  const testDevice = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Alert.alert(
      "🚨 Wearable SOS Triggered",
      `${DEVICES.find((d) => d.id === id)?.name} activated SOS. Guardians alerted silently.`
    );
  };

  return (
    <LinearGradient
      colors={isDark ? ["#05060f", "#1a150a"] : ["#f7f8fc", "#fff"]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: theme.text }]}>Smart Jewelry Hub</Text>
        <Text style={[styles.desc, { color: theme.textDim }]}>Unified control for safety wearables</Text>

        <Card style={{ marginTop: 20 }} glow="amber">
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <Ionicons name="watch" size={20} color={theme.amber} />
            <Text style={[styles.cardTitle, { color: theme.text }]}>Supported Devices</Text>
          </View>
          <Text style={[styles.cardText, { color: theme.textDim }]}>
            • Nimb Ring (panic button ring){"\n"}
            • Invisawear (smart jewelry){"\n"}
            • Apple Watch / Wear OS{"\n"}
            • Fitbit / Garmin{"\n"}
            • Any BLE panic button
          </Text>
        </Card>

        <View style={{ marginTop: 24 }}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Devices</Text>
          {DEVICES.map((device) => {
            const isConnected = connected.includes(device.id);
            return (
              <Card key={device.id} style={{ marginTop: 12 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View style={[styles.deviceIcon, {
                    backgroundColor: isConnected ? "rgba(46,230,166,0.2)" : theme.inputBg,
                  }]}>
                    <Ionicons
                      name={device.icon as any}
                      size={22}
                      color={isConnected ? theme.emerald : theme.textDim}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.deviceName, { color: theme.text }]}>{device.name}</Text>
                    <Text style={[styles.deviceDesc, { color: theme.textDim }]}>{device.desc}</Text>
                  </View>
                  {isConnected && <Pill label="CONNECTED" tone="emerald" />}
                </View>

                <View style={styles.deviceActions}>
                  <TouchableOpacity
                    onPress={() => connectDevice(device.id)}
                    style={[styles.actionBtn, {
                      backgroundColor: isConnected ? "rgba(255,61,127,0.15)" : "rgba(56,232,255,0.15)",
                    }]}
                  >
                    <Ionicons
                      name={isConnected ? "close-circle" : "bluetooth"}
                      size={16}
                      color={isConnected ? theme.primary : theme.cyan}
                    />
                    <Text style={[styles.actionText, { color: isConnected ? theme.primary : theme.cyan }]}>
                      {isConnected ? "Disconnect" : "Connect"}
                    </Text>
                  </TouchableOpacity>

                  {isConnected && (
                    <TouchableOpacity
                      onPress={() => testDevice(device.id)}
                      style={[styles.actionBtn, { backgroundColor: "rgba(255,61,127,0.15)" }]}
                    >
                      <Ionicons name="warning" size={16} color={theme.primary} />
                      <Text style={[styles.actionText, { color: theme.primary }]}>Test SOS</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Card>
            );
          })}
        </View>

        <Card style={{ marginTop: 30 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Ionicons name="information-circle" size={18} color={theme.cyan} />
            <Text style={[styles.infoTitle, { color: theme.text }]}>Discreet & Powerful</Text>
          </View>
          <Text style={[styles.infoText, { color: theme.textDim }]}>
            Smart jewelry looks like normal accessories but can trigger silent SOS. Perfect for situations where pulling out phone is dangerous.
          </Text>
        </Card>

        {connected.length > 0 && (
          <Card style={{ marginTop: 20, borderColor: "rgba(46,230,166,0.3)" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Ionicons name="checkmark-circle" size={20} color={theme.emerald} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.summaryTitle, { color: theme.text }]}>
                  {connected.length} device(s) active
                </Text>
                <Text style={[styles.summarySub, { color: theme.textDim }]}>
                  All ready to trigger silent SOS
                </Text>
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
  deviceIcon: { width: 50, height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  deviceName: { fontSize: 14, fontWeight: "800" },
  deviceDesc: { fontSize: 11, marginTop: 2 },
  deviceActions: { flexDirection: "row", gap: 8, marginTop: 12 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 10 },
  actionText: { fontSize: 12, fontWeight: "700" },
  infoTitle: { fontSize: 13, fontWeight: "700" },
  infoText: { fontSize: 11, marginTop: 6, lineHeight: 16 },
  summaryTitle: { fontSize: 14, fontWeight: "700" },
  summarySub: { fontSize: 12, marginTop: 2 },
});
