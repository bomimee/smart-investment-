import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../provider/ThemeContext";

export default function ThemeToggle() {
  const { mode, setMode, theme } = useTheme();
  const C = theme.colors;

  // system이면 현재 scheme 기준으로 표시하고 싶으면 mode 대신 scheme로 판단해도 됨
  const isDark = mode === "dark";

  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: C.card, borderColor: C.border },
      ]}
    >
      <Pressable
        onPress={() => setMode("light")}
        style={[
          styles.half,
          !isDark && { backgroundColor: C.accent },
        ]}
      >
        <Text style={[styles.txt, { color: !isDark ? "#fff" : C.textMuted }]}>
          LIGHT
        </Text>
      </Pressable>

      <Pressable
        onPress={() => setMode("dark")}
        style={[
          styles.half,
          isDark && { backgroundColor: C.accent },
        ]}
      >
        <Text style={[styles.txt, { color: isDark ? "#fff" : C.textMuted }]}>
          DARK
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 999,
    overflow: "hidden",
    height: 30,
    width: 150,
  },
  half: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  txt: {
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
