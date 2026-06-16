/**
 * Bottom tab navigator — main app screens + Features hub.
 */
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "../theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";

import DashboardScreen from "../screens/DashboardScreen";
import SOSScreen from "../screens/SOSScreen";
import TrackingScreen from "../screens/TrackingScreen";
import CommunityScreen from "../screens/CommunityScreen";
import SettingsScreen from "../screens/SettingsScreen";
import FeaturesScreen from "../screens/FeaturesScreen";

// Feature screens
import DeepfakeScreen from "../screens/DeepfakeScreen";
import CompanionScreen from "../screens/CompanionScreen";
import StalkerScreen from "../screens/StalkerScreen";
import MeshSOSScreen from "../screens/MeshSOSScreen";
import SafetyPodsScreen from "../screens/SafetyPodsScreen";
import BystanderScreen from "../screens/BystanderScreen";
import BlockchainScreen from "../screens/BlockchainScreen";
import BiometricScreen from "../screens/BiometricScreen";
import WearablesScreen from "../screens/WearablesScreen";
import WalkWithMeScreen from "../screens/WalkWithMeScreen";
import TraumaCareScreen from "../screens/TraumaCareScreen";
import LegalAidScreen from "../screens/LegalAidScreen";

const Tab = createBottomTabNavigator();
const FeatureStack = createNativeStackNavigator();

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const TABS: { name: string; component: any; icon: IconName; label: string }[] = [
  { name: "Dashboard", component: DashboardScreen, icon: "shield-checkmark", label: "Home" },
  { name: "SOS", component: SOSScreen, icon: "warning", label: "SOS" },
  { name: "Features", component: FeaturesScreen, icon: "sparkles", label: "Features" },
  { name: "Tracking", component: TrackingScreen, icon: "navigate", label: "Track" },
  { name: "Settings", component: SettingsScreen, icon: "settings", label: "Settings" },
];

function FeaturesStack() {
  return (
    <FeatureStack.Navigator screenOptions={{ headerShown: false }}>
      <FeatureStack.Screen name="FeaturesHub" component={FeaturesScreen} />
      <FeatureStack.Screen name="Deepfake" component={DeepfakeScreen} />
      <FeatureStack.Screen name="Companion" component={CompanionScreen} />
      <FeatureStack.Screen name="Stalker" component={StalkerScreen} />
      <FeatureStack.Screen name="MeshSOS" component={MeshSOSScreen} />
      <FeatureStack.Screen name="SafetyPods" component={SafetyPodsScreen} />
      <FeatureStack.Screen name="Bystander" component={BystanderScreen} />
      <FeatureStack.Screen name="Blockchain" component={BlockchainScreen} />
      <FeatureStack.Screen name="Biometric" component={BiometricScreen} />
      <FeatureStack.Screen name="Wearables" component={WearablesScreen} />
      <FeatureStack.Screen name="WalkWithMe" component={WalkWithMeScreen} />
      <FeatureStack.Screen name="TraumaCare" component={TraumaCareScreen} />
      <FeatureStack.Screen name="LegalAid" component={LegalAidScreen} />
    </FeatureStack.Navigator>
  );
}

export default function AppTabs() {
  const { theme, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.tabBarBorder,
          borderTopWidth: 1,
          paddingTop: 6,
          height: 72,
          ...styles.shadow(isDark ? theme.shadow : "rgba(15,23,42,0.08)"),
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600", marginBottom: 6 },
      }}
    >
      {TABS.map((t) => (
        <Tab.Screen
          key={t.name}
          name={t.name}
          component={t.name === "Features" ? FeaturesStack : t.component}
          options={{
            tabBarLabel: t.label,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name={t.icon} size={size} color={color} />
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

const styles = {
  shadow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  }),
};
