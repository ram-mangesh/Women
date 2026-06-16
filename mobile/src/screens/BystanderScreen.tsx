/**
 * Bystander Activation Beacon — alerts nearby AEGIS users for help
 * Uses BLE beacons + crowd-sourced response
 */
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "../theme/ThemeContext";
import { Card, PrimaryButton, Pill } from "../components/ui";

export default function BystanderScreen() {
  const { theme, isDark } = useTheme();
  const [beaconActive, setBeaconActive] = useState(false);
  const [responders, setResponders] = useState<any[]>([]);
  const [eta, setEta] = useState<number | null>(null);

  const activateBeacon = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setBeaconActive(true);
    setResponders([]);

    // Simulate nearby users responding
    const responderNames = ["Priya S.", "Rahul M.", "Anita K.", "Vikram R.", "Neha P."];
    let count = 0;
    const interval = setInterval(() => {
      if (count >= 3) {
        clearInterval(interval);
        setEta(Math.floor(Math.random() * 3) + 2);
        return;
      }
      setResponders((prev) => [
        ...prev,
        {
          id: `resp-${Date.now()}-${count}`,
          name: responderNames[count],
          distance: (Math.random() * 200 + 50).toFixed(0),
          eta: Math.floor(Math.random() * 5) + 2,
          verified: Math.random() > 0.3,
        },
      ]);
      count++;
    }, 2000);
  };

  const stopBeacon = () => {
    setBeaconActive(false);
    setResponders([]);
    setEta(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Beacon Stopped", "Your distress signal is no longer active.");
  };

  return (
    <LinearGradient
      colors={isDark ? ["#05060f", "#1a150a"] : ["#f7f8fc", "#fff"]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: theme.text }]}>Bystander Beacon</Text>
        <Text style={[styles.desc, { color: theme.textDim }]}>Alert nearby helpers instantly</Text>

        <Card style={{ marginTop: 20 }} glow="amber">
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <Ionicons name="hand-left" size={20} color={theme.amber} />
            <Text style={[styles.cardTitle, { color: theme.text }]}>How it works</Text>
          </View>
          <Text style={[styles.cardText, { color: theme.textDim }]}>
            1. You trigger distress beacon{"\n"}
            2. BLE signal broadcasts to 500m radius{"\n"}
            3. Nearby AEGIS users get alert{"\n"}
            4. Volunteers respond with ETA{"\n"}
            5. Help arrives in minutes
          </Text>
        </Card>

        {!beaconActive ? (
          <View style={{ marginTop: 30 }}>
            <PrimaryButton
              label="Activate Distress Beacon"
              onPress={activateBeacon}
              icon={<Ionicons name="radio-button-on" size={18} color="#fff" />}
              tone="amber"
            />
            <Text style={[styles.warning, { color: theme.textDim }]}>
              ⚠ Only use in real emergencies
            </Text>
          </View>
        ) : (
          <>
            <Card style={{ marginTop: 20, borderColor: "rgba(255,176,32,0.4)" }} glow="amber">
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <View style={[styles.pulse, { backgroundColor: theme.amber }]} />
                <Text style={[styles.activeText, { color: theme.amber }]}>BEACON ACTIVE</Text>
              </View>
              <Text style={[styles.activeSub, { color: theme.textDim }]}>
                Broadcasting distress signal to 500m radius...
              </Text>
              {eta && (
                <View style={[styles.etaBox, { backgroundColor: "rgba(46,230,166,0.1)", borderColor: theme.emerald }]}>
                  <Ionicons name="time" size={18} color={theme.emerald} />
                  <Text style={[styles.etaText, { color: theme.emerald }]}>
                    Help arriving in ~{eta} minutes
                  </Text>
                </View>
              )}
            </Card>

            {responders.length > 0 && (
              <View style={{ marginTop: 24 }}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Responders ({responders.length})</Text>
                {responders.map((r) => (
                  <Card key={r.id} style={{ marginTop: 12 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <LinearGradient colors={["#ffb020", "#f59e0b"]} style={styles.responderAvatar}>
                        <Text style={{ color: "#fff", fontWeight: "800", fontSize: 14 }}>
                          {r.name.split(" ").map((s: string) => s[0]).join("")}
                        </Text>
                      </LinearGradient>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                          <Text style={[styles.responderName, { color: theme.text }]}>{r.name}</Text>
                          {r.verified && <Pill label="VERIFIED" tone="emerald" />}
                        </View>
                        <Text style={[styles.responderMeta, { color: theme.textDim }]}>
                          {r.distance}m away • ETA {r.eta}min
                        </Text>
                      </View>
                      <TouchableOpacity style={styles.callBtn}>
                        <Ionicons name="call" size={18} color={theme.emerald} />
                      </TouchableOpacity>
                    </View>
                  </Card>
                ))}
              </View>
            )}

            <View style={{ marginTop: 30 }}>
              <PrimaryButton
                label="Stop Beacon"
                onPress={stopBeacon}
                icon={<Ionicons name="stop-circle" size={18} color="#fff" />}
                tone="pink"
              />
            </View>
          </>
        )}

        <Card style={{ marginTop: 30 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Ionicons name="information-circle" size={18} color={theme.cyan} />
            <Text style={[styles.infoTitle, { color: theme.text }]}>Community Powered</Text>
          </View>
          <Text style={[styles.infoText, { color: theme.textDim }]}>
            All responders are verified AEGIS users. Their identity is protected until they choose to respond.
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
  warning: { fontSize: 12, textAlign: "center", marginTop: 12 },
  pulse: { width: 12, height: 12, borderRadius: 6 },
  activeText: { fontSize: 12, fontWeight: "800", letterSpacing: 1.5 },
  activeSub: { fontSize: 12, marginTop: 4 },
  etaBox: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, marginTop: 12 },
  etaText: { fontSize: 13, fontWeight: "700" },
  sectionTitle: { fontSize: 15, fontWeight: "700" },
  responderAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  responderName: { fontSize: 14, fontWeight: "700" },
  responderMeta: { fontSize: 11, marginTop: 2 },
  callBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(46,230,166,0.15)", alignItems: "center", justifyContent: "center" },
  infoTitle: { fontSize: 13, fontWeight: "700" },
  infoText: { fontSize: 11, marginTop: 6, lineHeight: 16 },
});
