/**
 * Root navigator — switches between Auth stack and App tabs based on login state.
 */
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuthStore } from "../store/authStore";
import AuthStack from "./AuthStack";
import AppTabs from "./AppTabs";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const user = useAuthStore((s) => s.user);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="App" component={AppTabs} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}
