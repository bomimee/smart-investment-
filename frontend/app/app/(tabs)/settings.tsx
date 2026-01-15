import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "../../provider/ThemeContext";

export default function SettingsScreen() {
  const { mode, setMode, theme } = useTheme();
  const C = theme.colors;

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <Text style={[styles.title, { color: C.text }]}>테마 설정</Text>

      {(["system", "light", "dark"] as const).map((m) => (
        <Pressable
          key={m}
          onPress={() => setMode(m)}
          style={[
            styles.item,
            { borderColor: C.border, backgroundColor: C.card },
            mode === m ? { borderWidth: 2, borderColor: C.accent } : null,
          ]}
        >
          <Text style={{ color: C.text, fontWeight: "800" }}>
            {m.toUpperCase()}
          </Text>
          <Text style={{ color: C.textMuted }}>
            {mode === m ? "선택됨" : ""}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "900", marginBottom: 12 },
  item: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
});
