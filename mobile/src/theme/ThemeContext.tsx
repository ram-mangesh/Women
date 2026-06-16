/**
 * Theme context — light/dark mode with system preference detection.
 * Persists user choice via AsyncStorage.
 */
import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { darkTheme, lightTheme, type Theme } from "./colors";

type Mode = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  mode: Mode;
  setMode: (m: Mode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: darkTheme,
  mode: "system",
  setMode: () => {},
  isDark: true,
});

const STORAGE_KEY = "aegis:theme_mode";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<Mode>("system");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (v === "light" || v === "dark" || v === "system") setModeState(v);
    });
  }, []);

  const setMode = (m: Mode) => {
    setModeState(m);
    AsyncStorage.setItem(STORAGE_KEY, m);
  };

  const resolvedScheme = mode === "system" ? (systemScheme ?? "dark") : mode;
  const theme = resolvedScheme === "dark" ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode, isDark: resolvedScheme === "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
