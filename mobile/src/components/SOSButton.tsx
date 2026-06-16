import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function SOSButton({ onPress, active }: { onPress: () => void; active: boolean }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <View style={styles.container}>
      {/* Pulse rings */}
      {[0, 1, 2].map((i) => (
        <Animated.View key={i} style={[
          styles.ring,
          {
            transform: [{ scale: pulse }],
            opacity: pulse.interpolate({ inputRange: [1, 1.1], outputRange: [0.5, 0] }),
            borderColor: active ? "#ff3d7f" : "#ff3d7f80",
          },
        ]} />
      ))}
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <LinearGradient
          colors={active ? ["#dc2626", "#991b1b"] : ["#ff3d7f", "#e11d68"]}
          style={styles.button}
        >
          <Ionicons name="warning" size={44} color="#fff" />
          <Text style={styles.label}>{active ? "DISARM" : "SOS"}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: 180, height: 180, alignItems: "center", justifyContent: "center" },
  ring: { position: "absolute", width: 180, height: 180, borderRadius: 90, borderWidth: 2 },
  button: {
    width: 150, height: 150, borderRadius: 75,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#ff3d7f", shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6, shadowRadius: 20, elevation: 16,
  },
  label: { color: "#fff", fontSize: 12, fontWeight: "900", letterSpacing: 3, marginTop: 4 },
});
