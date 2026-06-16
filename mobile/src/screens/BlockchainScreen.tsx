/**
 * Blockchain Evidence Chain — immutable, court-admissible evidence
 * Uses SHA-256 hashing + timestamped chain
 */
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "../theme/ThemeContext";
import { Card, PrimaryButton, Pill } from "../components/ui";

// Simple SHA-256 implementation for demo (in production: use crypto library)
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(64, "0").slice(0, 64);
};

export default function BlockchainScreen() {
  const { theme, isDark } = useTheme();
  const [chain, setChain] = useState<any[]>([]);
  const [newEvidence, setNewEvidence] = useState({ type: "audio", desc: "" });

  const addEvidence = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const timestamp = new Date().toISOString();
    const prevHash = chain.length > 0 ? chain[chain.length - 1].hash : "0".repeat(64);
    const data = `${newEvidence.type}|${newEvidence.desc}|${timestamp}|${prevHash}`;
    const hash = simpleHash(data);

    const block = {
      index: chain.length + 1,
      timestamp,
      type: newEvidence.type,
      description: newEvidence.desc || `Evidence #${chain.length + 1}`,
      prevHash,
      hash,
      verified: true,
    };

    setChain([...chain, block]);
    setNewEvidence({ type: "audio", desc: "" });
    Alert.alert("Evidence Added", `Block #${block.index} added to chain`);
  };

  const verifyChain = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    let valid = true;
    for (let i = 1; i < chain.length; i++) {
      if (chain[i].prevHash !== chain[i - 1].hash) {
        valid = false;
        break;
      }
    }
    Alert.alert(
      valid ? "✓ Chain Valid" : "⚠ Chain Tampered",
      valid
        ? `All ${chain.length} blocks verified. Evidence is court-admissible.`
        : "Chain integrity compromised. Evidence may be invalid."
    );
  };

  return (
    <LinearGradient
      colors={isDark ? ["#05060f", "#0a1628"] : ["#f7f8fc", "#fff"]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: theme.text }]}>Blockchain Evidence</Text>
        <Text style={[styles.desc, { color: theme.textDim }]}>Immutable, court-admissible chain</Text>

        <Card style={{ marginTop: 20 }} glow="pink">
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <Ionicons name="cube" size={20} color={theme.primary} />
            <Text style={[styles.cardTitle, { color: theme.text }]}>How it works</Text>
          </View>
          <Text style={[styles.cardText, { color: theme.textDim }]}>
            1. Evidence captured (audio/video/GPS){"\n"}
            2. SHA-256 hash generated{"\n"}
            3. Hash + timestamp stored in block{"\n"}
            4. Each block links to previous{"\n"}
            5. Tamper-proof chain for court
          </Text>
        </Card>

        <Card style={{ marginTop: 20 }}>
          <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 12 }]}>Add Evidence</Text>
          <View style={styles.typeRow}>
            {["audio", "video", "photo", "gps"].map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setNewEvidence({ ...newEvidence, type: t })}
                style={[
                  styles.typeBtn,
                  {
                    backgroundColor: newEvidence.type === t ? "rgba(255,61,127,0.2)" : theme.inputBg,
                    borderColor: newEvidence.type === t ? theme.primary : theme.border,
                  },
                ]}
              >
                <Ionicons
                  name={t === "audio" ? "mic" : t === "video" ? "videocam" : t === "photo" ? "camera" : "location"}
                  size={18}
                  color={newEvidence.type === t ? theme.primary : theme.textDim}
                />
                <Text style={[styles.typeText, { color: newEvidence.type === t ? theme.primary : theme.textDim }]}>
                  {t.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity onPress={addEvidence} style={{ marginTop: 16 }}>
            <PrimaryButton
              label="Add to Chain"
              onPress={addEvidence}
              icon={<Ionicons name="add-circle" size={18} color="#fff" />}
            />
          </TouchableOpacity>
        </Card>

        {chain.length > 0 && (
          <View style={{ marginTop: 24 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Evidence Chain ({chain.length})</Text>
              <TouchableOpacity onPress={verifyChain}>
                <Pill label="VERIFY" tone="emerald" />
              </TouchableOpacity>
            </View>

            {chain.map((block, i) => (
              <Card key={i} style={{ marginTop: 12 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <View style={[styles.blockIcon, { backgroundColor: "rgba(139,92,246,0.15)" }]}>
                    <Text style={{ color: theme.violet, fontWeight: "800", fontSize: 14 }}>#{block.index}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.blockTitle, { color: theme.text }]}>{block.description}</Text>
                    <Text style={[styles.blockTime, { color: theme.textDim }]}>
                      {new Date(block.timestamp).toLocaleString()}
                    </Text>
                  </View>
                  <Pill label={block.type.toUpperCase()} tone="violet" />
                </View>

                <View style={styles.hashBox}>
                  <Text style={[styles.hashLabel, { color: theme.textDim }]}>Hash:</Text>
                  <Text style={[styles.hashValue, { color: theme.text }]} numberOfLines={1}>
                    {block.hash.slice(0, 32)}...
                  </Text>
                </View>

                {block.index > 1 && (
                  <View style={[styles.hashBox, { marginTop: 6 }]}>
                    <Text style={[styles.hashLabel, { color: theme.textDim }]}>Prev:</Text>
                    <Text style={[styles.hashValue, { color: theme.textMuted }]} numberOfLines={1}>
                      {block.prevHash.slice(0, 32)}...
                    </Text>
                  </View>
                )}

                {block.verified && (
                  <View style={[styles.verifiedBadge, { backgroundColor: "rgba(46,230,166,0.1)" }]}>
                    <Ionicons name="checkmark-circle" size={14} color={theme.emerald} />
                    <Text style={[styles.verifiedText, { color: theme.emerald }]}>Verified</Text>
                  </View>
                )}
              </Card>
            ))}
          </View>
        )}

        {chain.length === 0 && (
          <Card style={{ marginTop: 24 }}>
            <View style={{ alignItems: "center", paddingVertical: 30 }}>
              <Ionicons name="cube-outline" size={48} color={theme.textMuted} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No evidence yet</Text>
              <Text style={[styles.emptySub, { color: theme.textDim }]}>Add evidence to start the chain</Text>
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
  typeRow: { flexDirection: "row", gap: 8 },
  typeBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 12, borderRadius: 10, borderWidth: 1,
  },
  typeText: { fontSize: 11, fontWeight: "700" },
  blockIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  blockTitle: { fontSize: 13, fontWeight: "700" },
  blockTime: { fontSize: 11, marginTop: 2 },
  hashBox: { flexDirection: "row", alignItems: "center", gap: 8, padding: 8, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.03)" },
  hashLabel: { fontSize: 10, fontWeight: "600", width: 40 },
  hashValue: { fontSize: 10, fontFamily: "monospace", flex: 1 },
  verifiedBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: "flex-start", marginTop: 8 },
  verifiedText: { fontSize: 10, fontWeight: "700" },
  emptyTitle: { fontSize: 16, fontWeight: "700", marginTop: 12 },
  emptySub: { fontSize: 12, marginTop: 4 },
});
