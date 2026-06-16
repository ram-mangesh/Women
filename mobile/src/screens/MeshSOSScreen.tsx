/**
 * Mesh Network SOS — offline SOS via Bluetooth mesh
 * Uses WebRTC data channels for P2P communication
 */
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "../theme/ThemeContext";
import { Card, PrimaryButton, Pill } from "../components/ui";

export default function MeshSOSScreen() {
  const { theme, isDark } = useTheme();
  const [meshActive, setMeshActive] = useState(false);
  const [nearbyNodes, setNearbyNodes] = useState<any[]>([]);
  const [sosSent, setSosSent] = useState(false);
  const [relayCount, setRelayCount] = useState(0);

  useEffect(() => {
    if (meshActive) {
      // Simulate discovering nearby nodes
      const interval = setInterval(() => {
        const newNode = {
          id: `node-${Date.now()}`,
          name: `User ${Math.floor(Math.random() * 1000)}`,
          distance: (Math.random() * 500).toFixed(0),
          signal: Math.floor(Math.random() * 30) + 70,
        };
        setNearbyNodes((prev) => [...prev, newNode].slice(0, 8));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [meshActive]);

  const activateMesh = () => {
    setMeshActive(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Mesh Network Active", "Scanning for nearby AEGIS users...");
  };

  const sendMeshSOS = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setSosSent(true);
    setRelayCount(nearbyNodes.length);
    setTimeout(() => {
      Alert.alert(
        "SOS Broadcasted",
        `Your SOS has been relayed through ${nearbyNodes.length} nearby users. Help is on the way!`,
        [{ text: "OK", onPress: () => setSosSent(false) }]
      );
    }, 1500);
  };

  return (
    <LinearGradient
      colors={isDark ? ["#05060f", "#0a1628"] : ["#f7f8fc", "#fff"]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: theme.text }]}>Mesh Network SOS</Text>
        <Text style={[styles.desc, { color: theme.textDim }]}>Offline SOS via Bluetooth mesh</Text>

        <Card style={{ marginTop: 20 }} glow="pink">
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <Ionicons name="radio" size={20} color={theme.primary} />
            <Text style={[styles.cardTitle, { color: theme.text }]}>How it works</Text>
          </View>
          <Text style={[styles.cardText, { color: theme.textDim }]}>
            When no cellular/WiFi:{"\n"}
            1. Phone broadcasts BLE beacon{"\n"}
            2. Nearby AEGIS users receive SOS{"\n"}
            3. They relay to next nodes (multi-hop){"\n"}
            4. SOS reaches internet-connected user{"\n"}
            5. Emergency services notified
          </Text>
        </Card>

        {!meshActive ? (
          <View style={{ marginTop: 30 }}>
            <PrimaryButton
              label="Activate Mesh Network"
              onPress={activateMesh}
              icon={<Ionicons name="radio" size={18} color="#fff" />}
            />
          </View>
        ) : (
          <>
            <Card style={{ marginTop: 20, borderColor: "rgba(46,230,166,0.4)" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View style={[styles.statusDot, { backgroundColor: theme.emerald }]} />
                <Text style={[styles.statusText, { color: theme.emerald }]}>MESH ACTIVE</Text>
                <Pill label={`${nearbyNodes.length} NODES`} tone="emerald" />
              </View>
              <Text style={[styles.statusSub, { color: theme.textDim }]}>
                Scanning for nearby AEGIS users...
              </Text>
            </Card>

            {nearbyNodes.length > 0 && (
              <View style={{ marginTop: 20 }}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Nearby Nodes</Text>
                {nearbyNodes.map((node) => (
                  <Card key={node.id} style={{ marginTop: 10 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <View style={[styles.nodeIcon, { backgroundColor: "rgba(56,232,255,0.15)" }]}>
                        <Ionicons name="person" size={18} color={theme.cyan} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.nodeName, { color: theme.text }]}>{node.name}</Text>
                        <Text style={[styles.nodeMeta, { color: theme.textDim }]}>
                          {node.distance}m • Signal {node.signal}%
                        </Text>
                      </View>
                      <Pill label="RELAY" tone="cyan" />
                    </View>
                  </Card>
                ))}
              </View>
            )}

            <View style={{ marginTop: 30 }}>
              <PrimaryButton
                label={sosSent ? "Broadcasting..." : "Send Mesh SOS"}
                onPress={sendMeshSOS}
                disabled={sosSent || nearbyNodes.length === 0}
                icon={<Ionicons name="warning" size={18} color="#fff" />}
              />
            </View>

            {sosSent && (
              <Card style={{ marginTop: 20 }} glow="amber">
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Ionicons name="checkmark-circle" size={24} color={theme.amber} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.sosTitle, { color: theme.text }]}>SOS Broadcasted!</Text>
                    <Text style={[styles.sosSub, { color: theme.textDim }]}>
                      Relayed through {relayCount} nodes
                    </Text>
                  </View>
                </View>
              </Card>
            )}
          </>
        )}

        <Card style={{ marginTop: 30 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Ionicons name="information-circle" size={18} color={theme.cyan} />
            <Text style={[styles.infoTitle, { color: theme.text }]}>Demo Mode</Text>
          </View>
          <Text style={[styles.infoText, { color: theme.textDim }]}>
            This is a simulation. Real implementation uses Bluetooth LE mesh networking + WebRTC data channels for P2P communication.
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
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { fontSize: 12, fontWeight: "800", letterSpacing: 1.5 },
  statusSub: { fontSize: 12, marginTop: 6 },
  sectionTitle: { fontSize: 15, fontWeight: "700" },
  nodeIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  nodeName: { fontSize: 13, fontWeight: "700" },
  nodeMeta: { fontSize: 11, marginTop: 2 },
  sosTitle: { fontSize: 14, fontWeight: "700" },
  sosSub: { fontSize: 12, marginTop: 2 },
  infoTitle: { fontSize: 13, fontWeight: "700" },
  infoText: { fontSize: 11, marginTop: 6, lineHeight: 16 },
});
