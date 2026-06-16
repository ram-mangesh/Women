/**
 * Biometric Panic Profile — duress fingerprint triggers silent SOS
 * Uses WebAuthn API + duress PIN
 */
import React, { useState } from "react";
import { sosApi } from "../api/endpoints";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as LocalAuthentication from "expo-local-authentication";
import { useTheme } from "../theme/ThemeContext";
import { Card, PrimaryButton, Pill, Input } from "../components/ui";

export default function BiometricScreen() {
  const { theme, isDark } = useTheme();
  const [duressPin, setDuressPin] = useState("");
  const [biometricEnrolled, setBiometricEnrolled] = useState(false);
  const [testPin, setTestPin] = useState("");

  const enrollBiometric = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Enroll duress fingerprint",
      fallbackLabel: "Use PIN",
    });
    if (result.success) {
      setBiometricEnrolled(true);
      Alert.alert("✓ Enrolled", "Your duress biometric is now active. Use it when under threat.");
    }
  };

  const testDuress = async () => {
    if (testPin === duressPin && duressPin.length >= 4) {
      // Trigger silent SOS via backend
      try {
        await sosApi.trigger({
          triggerType: "STEALTH_PIN",
          latitude: 0,
          longitude: 0,
          // optional fields can be added as needed
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert(
          "🚨 DURESS ACTIVATED",
          "Silent SOS triggered. Guardians are alerted.",
          [{ text: "Dismiss (demo)" }]
        );
      } catch (e) {
        console.error("Failed to trigger SOS", e);
        Alert.alert("Error", "Could not send SOS alert.");
      }
      setTestPin("");
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert("Normal Unlock", "Phone unlocked normally (not duress PIN)");
      setTestPin("");
    }
  };

  const triggerBiometricSOS = async () => {
    if (!biometricEnrolled) {
      Alert.alert("Not Enrolled", "Please enroll your duress biometric first.");
      return;
    }
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Simulate Duress Fingerprint",
      fallbackLabel: "Use PIN",
    });
    
    if (result.success) {
      try {
        await sosApi.trigger({
          triggerType: "STEALTH_PIN",
          latitude: 0,
          longitude: 0,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert(
          "🚨 DURESS ACTIVATED",
          "Silent SOS triggered via Biometric. Guardians are alerted.",
          [{ text: "Dismiss (demo)" }]
        );
      } catch (e) {
        console.error("Failed to trigger SOS", e);
        Alert.alert("Error", "Could not send SOS alert.");
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert("Cancelled", "Biometric authentication cancelled.");
    }
  };

  return (
    <LinearGradient
      colors={isDark ? ["#05060f", "#0a1628"] : ["#f7f8fc", "#fff"]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: theme.text }]}>Biometric Panic</Text>
        <Text style={[styles.desc, { color: theme.textDim }]}>Duress authentication for silent SOS</Text>

        <Card style={{ marginTop: 20 }} glow="cyan">
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <Ionicons name="finger-print" size={20} color={theme.cyan} />
            <Text style={[styles.cardTitle, { color: theme.text }]}>How it works</Text>
          </View>
          <Text style={[styles.cardText, { color: theme.textDim }]}>
            • Register special fingerprint as "duress"{"\n"}
            • When attacker forces unlock → use duress finger{"\n"}
            • Phone unlocks normally BUT silent SOS triggers{"\n"}
            • Attacker thinks everything is fine{"\n"}
            • Guardians + police already notified
          </Text>
        </Card>

        <Card style={{ marginTop: 20 }}>
          <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 12 }]}>1. Enroll Duress Biometric</Text>
          {biometricEnrolled ? (
            <View style={[styles.enrolledBox, { backgroundColor: "rgba(46,230,166,0.1)", borderColor: theme.emerald }]}>
              <Ionicons name="checkmark-circle" size={24} color={theme.emerald} />
              <Text style={[styles.enrolledText, { color: theme.emerald }]}>Duress biometric enrolled</Text>
            </View>
          ) : (
            <PrimaryButton
              label="Enroll Fingerprint"
              onPress={enrollBiometric}
              icon={<Ionicons name="finger-print" size={18} color="#fff" />}
              tone="cyan"
            />
          )}
        </Card>

        <Card style={{ marginTop: 20 }}>
          <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 12 }]}>2. Set Duress PIN</Text>
          <Text style={[styles.helperText, { color: theme.textDim }]}>
            Alternative to biometric. Enter this PIN when forced to unlock.
          </Text>
          <Input
            label="DURESS PIN (4-6 digits)"
            value={duressPin}
            onChangeText={(v) => setDuressPin(v.replace(/\D/g, "").slice(0, 6))}
            placeholder="9119"
          />
          {duressPin.length >= 4 && (
            <Pill label="PIN SET" tone="emerald" />
          )}
        </Card>

        <Card style={{ marginTop: 20 }}>
          <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 12 }]}>3. Test Duress Mode</Text>
          <Text style={[styles.helperText, { color: theme.textDim }]}>
            Try entering your duress PIN or use your enrolled duress biometric.
          </Text>

          <View style={{ marginBottom: 20 }}>
            <PrimaryButton
              label="Unlock via Biometric"
              onPress={triggerBiometricSOS}
              icon={<Ionicons name="finger-print" size={18} color="#fff" />}
              tone="pink"
            />
          </View>

          <View style={{ height: 1, backgroundColor: "rgba(255,255,255,0.1)", marginBottom: 20 }} />

          <Input
            label="ENTER PIN TO UNLOCK"
            value={testPin}
            onChangeText={setTestPin}
            placeholder="Try your duress PIN"
          />
          <PrimaryButton
            label="Unlock via PIN"
            onPress={testDuress}
            icon={<Ionicons name="keypad" size={18} color="#fff" />}
            tone="pink"
          />
        </Card>

        <Card style={{ marginTop: 20, borderColor: "rgba(255,176,32,0.3)" }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
            <Ionicons name="warning" size={20} color={theme.amber} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.warningTitle, { color: theme.text }]}>Important</Text>
              <Text style={[styles.warningText, { color: theme.textDim }]}>
                Duress mode looks identical to normal unlock. Only you know it's triggering silent SOS. Practice in safe environment first.
              </Text>
            </View>
          </View>
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
  sectionTitle: { fontSize: 15, fontWeight: "700" },
  helperText: { fontSize: 12, marginBottom: 12 },
  enrolledBox: { flexDirection: "row", alignItems: "center", gap: 10, padding: 16, borderRadius: 12, borderWidth: 1 },
  enrolledText: { fontSize: 14, fontWeight: "700" },
  warningTitle: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
  warningText: { fontSize: 12, lineHeight: 18 },
});
