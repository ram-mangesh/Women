/**
 * Threat gauge — animated circular progress (SVG-based).
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from "react-native-svg";
import { useTheme } from "../theme/ThemeContext";

export default function ThreatGauge({ score, confidence, size = 140 }: { score: number; confidence: number; size?: number }) {
  const { theme, isDark } = useTheme();
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const gradId = `tg-${score}`;

  const gradient = score >= 80 ? { a: "#ff3d7f", b: "#ff8a3d" }
    : score >= 60 ? { a: "#ff8a3d", b: "#ffb020" }
    : score >= 35 ? { a: "#ffb020", b: "#38e8ff" }
    : { a: "#2ee6a6", b: "#38e8ff" };

  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
        <Defs>
          <SvgLinearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={gradient.a} />
            <Stop offset="100%" stopColor={gradient.b} />
          </SvgLinearGradient>
        </Defs>
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)"}
          strokeWidth={strokeWidth} fill="none"
        />
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth} strokeLinecap="round" fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <Text style={[styles.label, { color: theme.textDim }]}>THREAT</Text>
        <Text style={[styles.value, { color: theme.text }]}>{score}</Text>
        <Text style={[styles.sub, { color: theme.textDim }]}>/ 100</Text>
        <Text style={[styles.conf, { color: theme.emerald }]}>AI {Math.round(confidence)}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  label: { fontSize: 9, letterSpacing: 2, fontWeight: "700" },
  value: { fontSize: 30, fontWeight: "800", fontVariant: ["tabular-nums"] },
  sub: { fontSize: 10, marginTop: -2 },
  conf: { fontSize: 9, marginTop: 4, fontWeight: "700" },
});
