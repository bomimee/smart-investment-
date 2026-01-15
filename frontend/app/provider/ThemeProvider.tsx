import React from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { THEME, ThemeMode } from "../constants/theme";
import { ThemeContext, Scheme } from "./ThemeContext";

const STORAGE_KEY = "theme_mode";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = React.useState<ThemeMode>("system");
  const [systemScheme, setSystemScheme] = React.useState<Scheme>(
    (Appearance.getColorScheme() ?? "light") as Scheme
  );

  React.useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(((colorScheme ?? "light") as Scheme));
    });
    return () => sub.remove();
  }, []);

  React.useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved === "system" || saved === "light" || saved === "dark") {
        setModeState(saved);
      }
    })();
  }, []);

  const setMode = async (m: ThemeMode) => {
    setModeState(m);
    await AsyncStorage.setItem(STORAGE_KEY, m);
  };

  const scheme: Scheme = mode === "system" ? systemScheme : mode;
  const theme = scheme === "dark" ? THEME.dark : THEME.light;

  const value = React.useMemo(
    () => ({ mode, scheme, theme, setMode }),
    [mode, scheme, theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
