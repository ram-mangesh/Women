import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { Card, Pill, StatCard, PrimaryButton, Input } from "../components/ui";

const TYPES = ["Harassment", "Stalking", "Poor Lighting", "Suspicious", "Crowd"];

export default function CommunityScreen() {
  const { theme, isDark } = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const [reports, setReports] = useState([
    { id: "1", area: "Chandni Chowk North", type: "Stalking", severity: 4, votes: 48, verified: true, reporter: "Anonymous", time: "1h ago" },
    { id: "2", area: "Nehru Place Flyover", type: "Poor Lighting", severity: 3, votes: 27, verified: true, reporter: "Verified", time: "3h ago" },
    { id: "3", area: "Rohini Sector 7 Park", type: "Suspicious", severity: 3, votes: 19, verified: false, reporter: "Anonymous", time: "5h ago" },
    { id: "4", area: "Lajpat Nagar Metro", type: "Harassment", severity: 5, votes: 86, verified: true, reporter: "Verified", time: "8h ago" },
  ]);
  const [form, setForm] = useState({ area: "", type: "Harassment", severity: 3 });

  const submit = () => {
    if (!form.area.trim()) return;
    setReports([{ ...form, id: Date.now().toString(), votes: 1, verified: false, reporter: "Anonymous", time: "just now" }, ...reports]);
    setModalOpen(false);
    setForm({ area: "", type: "Harassment", severity: 3 });
  };

  const upvote = (id: string) => {
    setReports(reports.map((r) => r.id === id ? { ...r, votes: r.votes + 1 } : r));
  };

  return (
    <LinearGradient
      colors={isDark ? ["#05060f", "#0a1628"] : ["#f7f8fc", "#ffffff"]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
          <View>
            <Text style={[styles.title, { color: theme.text }]}>Community Intel</Text>
            <Text style={[styles.desc, { color: theme.textDim }]}>Citizen-powered safety network</Text>
          </View>
          <TouchableOpacity onPress={() => setModalOpen(true)} style={styles.fab}>
            <LinearGradient colors={["#ff3d7f", "#e11d68"]} style={styles.fabInner}>
              <Ionicons name="add" size={22} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.statGrid}>
          <StatCard label="Reports" value={reports.length} tone="pink" />
          <StatCard label="Verified" value={reports.filter((r) => r.verified).length} tone="emerald" />
          <StatCard label="Contributors" value="12.4k" tone="cyan" />
          <StatCard label="Rate" value="87%" tone="amber" />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 20 }]}>Recent Reports</Text>

        {reports.map((r) => {
          const tone = r.severity >= 4 ? "pink" : r.severity === 3 ? "amber" : "cyan";
          return (
            <Card key={r.id} style={[styles.report, { marginTop: 12 }]}>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={[styles.reportIcon, {
                  backgroundColor: tone === "pink" ? "rgba(255,61,127,0.15)" : tone === "amber" ? "rgba(255,176,32,0.15)" : "rgba(56,232,255,0.15)",
                }]}>
                  <Ionicons
                    name={r.type === "Poor Lighting" ? "moon" : "alert-triangle"}
                    size={18}
                    color={tone === "pink" ? theme.primary : tone === "amber" ? theme.amber : theme.cyan}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <Text style={[styles.reportArea, { color: theme.text }]}>{r.area}</Text>
                    <Pill label={r.type} tone={tone as any} />
                    {r.verified && <Pill label="VERIFIED" tone="emerald" />}
                  </View>
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
                    <Text style={[styles.reportMeta, { color: theme.textDim }]}>
                      <Ionicons name="person" size={10} /> {r.reporter}
                    </Text>
                    <Text style={[styles.reportMeta, { color: theme.textDim }]}>• {r.time}</Text>
                    <Text style={[styles.reportMeta, { color: theme.textDim }]}>• Severity {r.severity}/5</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => upvote(r.id)} style={styles.upvote}>
                  <Ionicons name="thumbs-up" size={14} color={theme.cyan} />
                  <Text style={[styles.upvoteText, { color: theme.cyan }]}>{r.votes}</Text>
                </TouchableOpacity>
              </View>
            </Card>
          );
        })}
      </ScrollView>

      {/* Report modal */}
      <Modal visible={modalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: theme.bgElevated }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>File Incident Report</Text>
              <TouchableOpacity onPress={() => setModalOpen(false)}>
                <Ionicons name="close" size={24} color={theme.textDim} />
              </TouchableOpacity>
            </View>

            <Input label="AREA / LOCATION" value={form.area}
              onChangeText={(v) => setForm({ ...form, area: v })}
              placeholder="e.g. Nehru Place Flyover" />

            <Text style={[styles.label, { color: theme.textDim }]}>TYPE</Text>
            <View style={styles.chipRow}>
              {TYPES.map((t) => (
                <TouchableOpacity key={t} onPress={() => setForm({ ...form, type: t })}
                  style={[styles.chip, form.type === t && { backgroundColor: "rgba(255,61,127,0.2)", borderColor: theme.primary }]}>
                  <Text style={[styles.chipText, { color: form.type === t ? theme.primary : theme.textDim }]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: theme.textDim }]}>SEVERITY ({form.severity}/5)</Text>
            <View style={styles.sevRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} onPress={() => setForm({ ...form, severity: s })}
                  style={[styles.sevBtn, {
                    backgroundColor: s <= form.severity ? "rgba(255,61,127,0.3)" : theme.inputBg,
                  }]}>
                  <Text style={{ color: s <= form.severity ? theme.primary : theme.textDim, fontWeight: "700" }}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ marginTop: 20 }}>
              <PrimaryButton label="Submit Report" onPress={submit} />
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingTop: 60, paddingBottom: 100 },
  title: { fontSize: 26, fontWeight: "800" },
  desc: { fontSize: 13, marginTop: 4 },
  fab: { marginBottom: 6 },
  fabInner: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 16 },
  sectionTitle: { fontSize: 15, fontWeight: "700" },
  report: { padding: 14 },
  reportIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  reportArea: { fontSize: 14, fontWeight: "700" },
  reportMeta: { fontSize: 11 },
  upvote: { flexDirection: "row", alignItems: "center", gap: 4, padding: 6, borderRadius: 8, backgroundColor: "rgba(56,232,255,0.1)" },
  upvoteText: { fontSize: 12, fontWeight: "700" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  modal: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: "800" },
  label: { fontSize: 11, letterSpacing: 1.5, fontWeight: "700", marginTop: 12, marginBottom: 8 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  chipText: { fontSize: 11, fontWeight: "700" },
  sevRow: { flexDirection: "row", gap: 8 },
  sevBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center" },
});
