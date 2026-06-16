import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { useAuthStore, type Role } from "../store/authStore";
import { PrimaryButton, Input, Card } from "../components/ui";

export default function LoginScreen({ navigation }: any) {
  const { theme, isDark } = useTheme();
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);
  const [email, setEmail] = useState("aanya@aegis.ai");
  const [password, setPassword] = useState("demo1234");
  const [role, setRole] = useState<Role>("USER");

  const handleLogin = async () => {
    await login(email, password, role);
  };

  const quickLogin = async (r: Role, e: string) => {
    setRole(r); setEmail(e);
    await login(e, "demo", r);
  };

  return (
    <LinearGradient
      colors={isDark ? ["#05060f", "#131836", "#1a1f3a"] : ["#f7f8fc", "#e8ecf5", "#dfe5f0"]}
      style={styles.container}
    >
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Logo */}
          <View style={styles.header}>
            <LinearGradient colors={["#ff3d7f", "#e11d68"]} style={styles.logo}>
              <Ionicons name="shield-checkmark" size={36} color="#fff" />
            </LinearGradient>
            <Text style={[styles.brand, { color: theme.text }]}>AEGIS</Text>
            <Text style={[styles.subtitle, { color: theme.textDim }]}>AI Women Safety Intelligence</Text>
          </View>

          {/* Form */}
          <Card style={styles.form}>
            <Text style={[styles.title, { color: theme.text }]}>Welcome back</Text>
            <Text style={[styles.desc, { color: theme.textDim }]}>Sign in to your safety command deck</Text>

            <View style={{ marginTop: 20 }}>
              <Input
                label="EMAIL" value={email} onChangeText={setEmail}
                placeholder="aanya@aegis.ai"
                icon={<Ionicons name="mail-outline" size={18} color={theme.textMuted} />}
              />
              <Input
                label="PASSWORD" value={password} onChangeText={setPassword}
                placeholder="••••••••" secureTextEntry
                icon={<Ionicons name="lock-closed-outline" size={18} color={theme.textMuted} />}
              />
            </View>

            <Text style={[styles.roleLabel, { color: theme.textDim }]}>Sign in as</Text>
            <View style={styles.roleRow}>
              {(["USER", "GUARDIAN", "ADMIN"] as Role[]).map((r) => {
                const selected = role === r;
                return (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setRole(r)}
                    style={[
                      styles.roleBtn,
                      {
                        backgroundColor: selected ? "rgba(255,61,127,0.15)" : theme.inputBg,
                        borderColor: selected ? theme.primary : theme.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name={r === "USER" ? "person" : r === "GUARDIAN" ? "eye" : "settings"}
                      size={16}
                      color={selected ? theme.primary : theme.textDim}
                    />
                    <Text style={[styles.roleText, { color: selected ? theme.primary : theme.textDim }]}>
                      {r}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={{ marginTop: 20 }}>
              <PrimaryButton label="Enter Command Deck" onPress={handleLogin} loading={loading}
                icon={<Ionicons name="log-in" size={18} color="#fff" />} />
            </View>

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
              <Text style={[styles.dividerText, { color: theme.textMuted }]}>DEMO</Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            </View>

            <View style={styles.quickRow}>
              <TouchableOpacity style={styles.quickBtn} onPress={() => quickLogin("USER", "aanya@aegis.ai")}>
                <Ionicons name="person" size={18} color={theme.primary} />
                <Text style={[styles.quickText, { color: theme.textDim }]}>User</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickBtn} onPress={() => quickLogin("GUARDIAN", "rahul@aegis.ai")}>
                <Ionicons name="eye" size={18} color={theme.cyan} />
                <Text style={[styles.quickText, { color: theme.textDim }]}>Guardian</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickBtn} onPress={() => quickLogin("ADMIN", "admin@aegis.ai")}>
                <Ionicons name="shield" size={18} color={theme.amber} />
                <Text style={[styles.quickText, { color: theme.textDim }]}>Admin</Text>
              </TouchableOpacity>
            </View>
          </Card>

          <TouchableOpacity onPress={() => navigation.navigate("Register")} style={styles.registerLink}>
            <Text style={[styles.registerText, { color: theme.textDim }]}>
              New to AEGIS? <Text style={{ color: theme.primary, fontWeight: "700" }}>Create account</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, padding: 20, paddingTop: 60 },
  header: { alignItems: "center", marginBottom: 30 },
  logo: {
    width: 76, height: 76, borderRadius: 22,
    alignItems: "center", justifyContent: "center",
    marginBottom: 14,
  },
  brand: { fontSize: 28, fontWeight: "900", letterSpacing: 2 },
  subtitle: { fontSize: 11, letterSpacing: 1.5, marginTop: 2 },
  form: { borderRadius: 24, padding: 24 },
  title: { fontSize: 22, fontWeight: "800" },
  desc: { fontSize: 13, marginTop: 4 },
  roleLabel: { fontSize: 11, fontWeight: "600", letterSpacing: 0.5, marginTop: 16, marginBottom: 8 },
  roleRow: { flexDirection: "row", gap: 8 },
  roleBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 10, borderRadius: 12, borderWidth: 1,
  },
  roleText: { fontSize: 12, fontWeight: "700" },
  divider: { flexDirection: "row", alignItems: "center", marginVertical: 20, gap: 12 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 10, letterSpacing: 2, fontWeight: "700" },
  quickRow: { flexDirection: "row", gap: 8 },
  quickBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 12, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  quickText: { fontSize: 12, fontWeight: "600" },
  registerLink: { alignItems: "center", marginTop: 20 },
  registerText: { fontSize: 13 },
});
