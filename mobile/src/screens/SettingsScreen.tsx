import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { useAuthStore } from "../store/authStore";
import { Card, PrimaryButton } from "../components/ui";

export default function SettingsScreen() {
  const { theme, mode, setMode, isDark } = useTheme();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const isSystemMode = mode === "system";
  const isManualDark = mode === "dark";
  const isManualLight = mode === "light";

  return (
    <LinearGradient
      colors={isDark ? ["#05060f", "#0a0d1f"] : ["#f7f8fc", "#ffffff"]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>

        {/* Profile */}
        <Card style={{ marginTop: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <LinearGradient colors={["#ff3d7f", "#38e8ff"]} style={styles.avatar}>
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>
                {user?.fullName.split(" ").map((s) => s[0]).join("").slice(0, 2)}
              </Text>
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={[styles.profileName, { color: theme.text }]}>{user?.fullName}</Text>
              <Text style={[styles.profileEmail, { color: theme.textDim }]}>{user?.email}</Text>
              <View style={{ flexDirection: "row", gap: 6, marginTop: 4 }}>
                <View style={[styles.roleBadge, { backgroundColor: "rgba(255,61,127,0.15)" }]}>
                  <Text style={{ color: theme.primary, fontSize: 10, fontWeight: "700" }}>{user?.role}</Text>
                </View>
              </View>
            </View>
          </View>
        </Card>

        {/* Appearance */}
        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24 }]}>Appearance</Text>
        <Card style={{ marginTop: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <Ionicons name="color-palette" size={18} color={theme.primary} />
            <Text style={[styles.settingLabel, { color: theme.text, flex: 1, marginLeft: 10 }]}>Theme</Text>
            <Text style={{ color: theme.textDim, fontSize: 12 }}>
              {mode === "system" ? "System" : mode === "dark" ? "Dark" : "Light"}
            </Text>
          </View>

          <View style={styles.themeRow}>
            {[
              { key: "system" as const, icon: "phone-portrait", label: "System" },
              { key: "light" as const, icon: "sunny", label: "Light" },
              { key: "dark" as const, icon: "moon", label: "Dark" },
            ].map((t) => (
              <TouchableOpacity
                key={t.key}
                onPress={() => setMode(t.key)}
                style={[
                  styles.themeBtn,
                  {
                    backgroundColor: mode === t.key
                      ? (t.key === "light" ? "rgba(255,176,32,0.2)" : t.key === "dark" ? "rgba(139,92,246,0.2)" : "rgba(56,232,255,0.2)")
                      : theme.inputBg,
                    borderColor: mode === t.key
                      ? (t.key === "light" ? theme.amber : t.key === "dark" ? theme.violet : theme.cyan)
                      : theme.border,
                  },
                ]}
              >
                <Ionicons
                  name={t.icon as any}
                  size={22}
                  color={mode === t.key ? (t.key === "light" ? theme.amber : t.key === "dark" ? theme.violet : theme.cyan) : theme.textDim}
                />
                <Text style={[styles.themeBtnLabel, {
                  color: mode === t.key
                    ? (t.key === "light" ? theme.amber : t.key === "dark" ? theme.violet : theme.cyan)
                    : theme.textDim,
                }]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Settings rows */}
        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24 }]}>Safety</Text>
        <Card style={{ marginTop: 8, padding: 0 }}>
          {[
            { icon: "location", label: "Location Services", sub: "Always allow for safety tracking", hasSwitch: true, value: true },
            { icon: "notifications", label: "Push Notifications", sub: "SOS alerts & guardian updates", hasSwitch: true, value: true },
            { icon: "mic", label: "Voice Trigger", sub: "Listen for 'HELP' keyword", hasSwitch: true, value: false },
            { icon: "phone-portrait", label: "Shake Detection", sub: "Trigger SOS by shaking phone", hasSwitch: true, value: true },
          ].map((s, i, arr) => (
            <View key={i} style={[styles.row, { borderBottomColor: theme.border, borderBottomWidth: i < arr.length - 1 ? 1 : 0 }]}>
              <View style={[styles.rowIcon, { backgroundColor: theme.inputBg }]}>
                <Ionicons name={s.icon as any} size={18} color={theme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowLabel, { color: theme.text }]}>{s.label}</Text>
                <Text style={[styles.rowSub, { color: theme.textDim }]}>{s.sub}</Text>
              </View>
              {s.hasSwitch && <Switch value={s.value} trackColor={{ true: theme.primary }} />}
            </View>
          ))}
        </Card>

        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24 }]}>Account</Text>
        <Card style={{ marginTop: 8, padding: 0 }}>
          {[
            { icon: "people", label: "Emergency Contacts", sub: "4 contacts configured" },
            { icon: "shield-checkmark", label: "Stealth PIN", sub: "9999 configured" },
            { icon: "lock-closed", label: "Change Password", sub: "Last changed 30d ago" },
            { icon: "information-circle", label: "About AEGIS", sub: "v1.0.0" },
          ].map((s, i, arr) => (
            <TouchableOpacity key={i} style={[styles.row, { borderBottomColor: theme.border, borderBottomWidth: i < arr.length - 1 ? 1 : 0 }]}>
              <View style={[styles.rowIcon, { backgroundColor: theme.inputBg }]}>
                <Ionicons name={s.icon as any} size={18} color={theme.cyan} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowLabel, { color: theme.text }]}>{s.label}</Text>
                <Text style={[styles.rowSub, { color: theme.textDim }]}>{s.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
            </TouchableOpacity>
          ))}
        </Card>

        <View style={{ marginTop: 30 }}>
          <PrimaryButton
            label="Sign Out"
            onPress={logout}
            tone="pink"
            icon={<Ionicons name="log-out" size={18} color="#fff" />}
          />
        </View>

        <Text style={[styles.footer, { color: theme.textMuted }]}>
          AEGIS Mobile v1.0.0 • © 2026
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingTop: 60, paddingBottom: 100 },
  title: { fontSize: 26, fontWeight: "800" },
  avatar: { width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center" },
  profileName: { fontSize: 17, fontWeight: "800" },
  profileEmail: { fontSize: 12, marginTop: 2 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  sectionTitle: { fontSize: 13, fontWeight: "700", letterSpacing: 0.5 },
  themeRow: { flexDirection: "row", gap: 8 },
  themeBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1,
    alignItems: "center", gap: 6,
  },
  themeBtnLabel: { fontSize: 12, fontWeight: "700" },
  settingLabel: { fontSize: 14, fontWeight: "600" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  rowIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  rowLabel: { fontSize: 14, fontWeight: "600" },
  rowSub: { fontSize: 11, marginTop: 2 },
  footer: { fontSize: 11, textAlign: "center", marginTop: 30 },
});
