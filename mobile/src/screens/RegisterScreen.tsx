import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { useAuthStore, type Role } from "../store/authStore";
import { PrimaryButton, Input, Card } from "../components/ui";

const BLOOD = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const RELATIONS = ["Parent", "Sibling", "Partner", "Friend", "Relative"];

export default function RegisterScreen({ navigation }: any) {
  const { theme, isDark } = useTheme();
  const register = useAuthStore((s) => s.register);
  const loading = useAuthStore((s) => s.loading);
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<Role>("USER");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [bloodGroup, setBloodGroup] = useState("B+");
  const [stealthPin, setStealthPin] = useState("");
  const [relationType, setRelationType] = useState("Parent");
  const [organization, setOrganization] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [codeError, setCodeError] = useState("");

  const roleMeta: Record<Role, { grad: [string, string]; label: string; icon: any }> = {
    USER: { grad: ["#ff3d7f", "#e11d68"], label: "User Protection", icon: "person" },
    GUARDIAN: { grad: ["#38e8ff", "#0ea5e9"], label: "Guardian Watch", icon: "eye" },
    ADMIN: { grad: ["#ffb020", "#f59e0b"], label: "Admin Command", icon: "shield" },
    POLICE: { grad: ["#ffb020", "#f59e0b"], label: "Admin", icon: "shield" },
  };
  const meta = roleMeta[role];

  const next = () => {
    if (step === 1) setStep(2);
    else if (step === 2) setStep(3);
    else handleSubmit();
  };

  const back = () => {
    if (step === 1) navigation.goBack();
    else setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (role === "ADMIN" && adminCode !== "AEGIS-ADMIN-2026") {
      setCodeError("Invalid code (try AEGIS-ADMIN-2026)");
      return;
    }
    setCodeError("");
    await register({
      fullName: fullName || "New User", email, password, phone, role,
      bloodGroup: role === "USER" ? bloodGroup : undefined,
      stealthPin: role === "USER" ? stealthPin : undefined,
      relationType: role === "GUARDIAN" ? relationType : undefined,
      organization: role === "ADMIN" ? organization : undefined,
    });
  };

  return (
    <LinearGradient
      colors={isDark ? ["#05060f", "#131836"] : ["#f7f8fc", "#e8ecf5"]}
      style={styles.container}
    >
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Progress */}
          <View style={styles.progressRow}>
            {[1, 2, 3].map((s) => (
              <View key={s} style={[
                styles.progressDot,
                { backgroundColor: s <= step ? theme.primary : theme.border },
              ]} />
            ))}
          </View>

          <Text style={[styles.stepLabel, { color: theme.textDim }]}>Step {step} of 3</Text>

          {/* Step 1: Role */}
          {step === 1 && (
            <View>
              <Text style={[styles.title, { color: theme.text }]}>How will you use AEGIS?</Text>
              <Text style={[styles.desc, { color: theme.textDim }]}>Pick the role that fits your safety needs</Text>

              <View style={{ marginTop: 24, gap: 12 }}>
                {(["USER", "GUARDIAN", "ADMIN"] as Role[]).map((r) => {
                  const m = roleMeta[r];
                  const selected = role === r;
                  return (
                    <TouchableOpacity key={r} onPress={() => setRole(r)} activeOpacity={0.8}>
                      <Card style={[
                        styles.roleCard,
                        selected && { borderColor: m.grad[0], borderWidth: 2 },
                      ]}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                          <LinearGradient colors={m.grad} style={styles.roleIcon}>
                            <Ionicons name={m.icon} size={22} color="#fff" />
                          </LinearGradient>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.roleTitle, { color: theme.text }]}>{m.label}</Text>
                            <Text style={[styles.roleDesc, { color: theme.textDim }]}>
                              {r === "USER" ? "SOS, AI tracking, safe routes"
                                : r === "GUARDIAN" ? "Track & protect your loved ones"
                                : "City-wide ops & verification"}
                            </Text>
                          </View>
                          {selected && <Ionicons name="checkmark-circle" size={24} color={m.grad[0]} />}
                        </View>
                      </Card>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Step 2: Basic info */}
          {step === 2 && (
            <View>
              <Text style={[styles.title, { color: theme.text }]}>Create your profile</Text>
              <Text style={[styles.desc, { color: theme.textDim }]}>Registering as <Text style={{ color: meta.grad[0], fontWeight: "700" }}>{meta.label}</Text></Text>

              <View style={{ marginTop: 20 }}>
                <Input label="FULL NAME" value={fullName} onChangeText={setFullName} placeholder="Aanya Kapoor"
                  icon={<Ionicons name="person-outline" size={18} color={theme.textMuted} />} />
                <Input label="PHONE" value={phone} onChangeText={setPhone} placeholder="+91 98XXX 12345"
                  icon={<Ionicons name="call-outline" size={18} color={theme.textMuted} />} />
                <Input label="EMAIL" value={email} onChangeText={setEmail} placeholder="aanya@aegis.ai"
                  icon={<Ionicons name="mail-outline" size={18} color={theme.textMuted} />} />
                <Input label="PASSWORD" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry
                  icon={<Ionicons name="lock-closed-outline" size={18} color={theme.textMuted} />} />
              </View>
            </View>
          )}

          {/* Step 3: Role-specific */}
          {step === 3 && (
            <View>
              <Text style={[styles.title, { color: theme.text }]}>
                {role === "USER" ? "Safety Details" : role === "GUARDIAN" ? "Guardian Setup" : "Admin Verification"}
              </Text>

              {role === "USER" && (
                <View style={{ marginTop: 20 }}>
                  <Text style={[styles.sectionLabel, { color: theme.textDim }]}>BLOOD GROUP</Text>
                  <View style={styles.chipRow}>
                    {BLOOD.map((bg) => (
                      <TouchableOpacity key={bg} onPress={() => setBloodGroup(bg)}
                        style={[styles.chip, bloodGroup === bg && { backgroundColor: "rgba(255,61,127,0.2)", borderColor: theme.primary }]}>
                        <Text style={[styles.chipText, { color: bloodGroup === bg ? theme.primary : theme.textDim }]}>{bg}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Input label="STEALTH PIN (4-6 digits, optional)" value={stealthPin}
                    onChangeText={(v) => setStealthPin(v.replace(/\D/g, "").slice(0, 6))}
                    placeholder="9999"
                    icon={<Ionicons name="key-outline" size={18} color={theme.textMuted} />} />
                </View>
              )}

              {role === "GUARDIAN" && (
                <View style={{ marginTop: 20 }}>
                  <Text style={[styles.sectionLabel, { color: theme.textDim }]}>RELATION TO WARD</Text>
                  <View style={styles.chipRow}>
                    {RELATIONS.map((r) => (
                      <TouchableOpacity key={r} onPress={() => setRelationType(r)}
                        style={[styles.chip, relationType === r && { backgroundColor: "rgba(56,232,255,0.2)", borderColor: theme.cyan }]}>
                        <Text style={[styles.chipText, { color: relationType === r ? theme.cyan : theme.textDim }]}>{r}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Card style={{ marginTop: 16, borderColor: "rgba(56,232,255,0.3)" }}>
                    <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
                      <Ionicons name="shield-checkmark" size={18} color={theme.cyan} />
                      <Text style={{ color: theme.textDim, fontSize: 12, flex: 1 }}>
                        You'll receive SMS, WhatsApp & voice alerts when your ward triggers SOS
                      </Text>
                    </View>
                  </Card>
                </View>
              )}

              {role === "ADMIN" && (
                <View style={{ marginTop: 20 }}>
                  <Input label="ORGANIZATION" value={organization} onChangeText={setOrganization}
                    placeholder="Delhi Police / NGO"
                    icon={<Ionicons name="business-outline" size={18} color={theme.textMuted} />} />
                  <Input label="ADMIN SECRET CODE" value={adminCode} onChangeText={setAdminCode}
                    placeholder="Provided by ops team" error={codeError}
                    icon={<Ionicons name="key-outline" size={18} color={theme.textMuted} />} />
                  <Text style={{ color: theme.textMuted, fontSize: 11, marginTop: 4 }}>
                    💡 Demo: <Text style={{ color: theme.amber }}>AEGIS-ADMIN-2026</Text>
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Buttons */}
          <View style={{ flexDirection: "row", gap: 10, marginTop: 30 }}>
            <TouchableOpacity onPress={back} style={[styles.secondaryBtn, { borderColor: theme.border }]}>
              <Ionicons name="arrow-back" size={18} color={theme.textDim} />
              <Text style={[styles.secondaryLabel, { color: theme.textDim }]}>Back</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <PrimaryButton
                label={step === 3 ? `Create ${role}` : "Continue"}
                onPress={next} loading={loading && step === 3}
                icon={<Ionicons name={step === 3 ? "checkmark" : "arrow-forward"} size={18} color="#fff" />}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, padding: 20, paddingTop: 60 },
  progressRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  progressDot: { flex: 1, height: 4, borderRadius: 2 },
  stepLabel: { fontSize: 11, letterSpacing: 1.5, fontWeight: "700" },
  title: { fontSize: 26, fontWeight: "800", marginTop: 16 },
  desc: { fontSize: 13, marginTop: 4 },
  roleCard: { padding: 16, borderWidth: 1, borderColor: "transparent" },
  roleIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  roleTitle: { fontSize: 16, fontWeight: "700" },
  roleDesc: { fontSize: 12, marginTop: 2 },
  sectionLabel: { fontSize: 11, letterSpacing: 1.5, fontWeight: "700", marginBottom: 8 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  chipText: { fontSize: 12, fontWeight: "700" },
  secondaryBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 16, paddingVertical: 14,
    borderRadius: 14, borderWidth: 1,
  },
  secondaryLabel: { fontSize: 14, fontWeight: "600" },
});
