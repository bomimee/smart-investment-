import React from "react";
import { THEME, ThemeMode } from "../constants/theme";

export type Scheme = "light" | "dark";
export type AppTheme = (typeof THEME)[Scheme];

export type ThemeContextValue = {
  mode: ThemeMode;                 // "system" | "light" | "dark"
  scheme: Scheme;                  // 실제 적용된 스킴
  theme: AppTheme;                 // THEME.light or THEME.dark
  setMode: (m: ThemeMode) => void; // 사용자가 선택
};

export const ThemeContext = React.createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("ThemeProvider is missing");
  return ctx;
}
