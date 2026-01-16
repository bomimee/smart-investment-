import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ImageBackground,
  TextInput,
} from "react-native";
import { useTheme } from "../../provider/ThemeContext";
import { login } from "@/services/auth";
import LoginScreen from "@/components/LoginScreen";

export default function Login() {
  const { theme, scheme } = useTheme();
  const C = theme.colors;
  const styles = useMemo(() => createStyles(C, scheme), [C, scheme]);
  const [id, setID] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");
  const Container: any = scheme === "dark" ? ImageBackground : View;
  const containerProps =
    scheme === "dark"
      ? { source: theme.backgroundImage, resizeMode: "cover" as const }
      : {};

  return (
    <Container style={styles.bg} {...containerProps}>
      <View style={styles.card}>
        {/* 입력 영역 */}
        <View style={styles.field}>
          <Text style={styles.label}>ID</Text>
          <TextInput
            value={id}
            onChangeText={setID}
            placeholder="ID"
            placeholderTextColor={C.textMuted}
            keyboardType="number-pad"
            maxLength={6}
            style={styles.input}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={C.textMuted}
            secureTextEntry
            style={styles.input}
          />
        </View>

        {/* 로그인 / 회원가입 */}
        <View style={styles.buttonRow}>
          <Pressable style={styles.button} onPress={login}>
            <Text style={styles.buttonText}>로그인</Text>
          </Pressable>

          <Pressable style={styles.buttonOutline}>
            <Text style={styles.buttonOutlineText}>회원가입</Text>
          </Pressable>
        </View>
        <LoginScreen />
      </View>
    </Container>
  );
}

function createStyles(
  C: {
    background: string;
    card: string;
    text: string;
    textMuted: string;
    border: string;
    primary: string;
    primaryText: string;
    danger: string;
  },
  scheme: "light" | "dark"
) {
  return StyleSheet.create({
    bg: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },

    card: {
      width: "100%",
      maxWidth: 360,
      padding: 20,
    },

    field: {
      gap: 10,
    },

    label: {
      fontSize: 12,
      color: C.textMuted,
      fontWeight: "600",
    },

    input: {
      borderWidth: 1,
      borderColor: C.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      backgroundColor: "#fff",
      color: C.text,
    },

    /* 로그인 / 회원가입 */
    buttonRow: {
      flexDirection: "row",
      gap: 10,
      marginTop: 20,
    },

    button: {
      flex: 1,
      height: 44,
      borderRadius: 10,
      backgroundColor: C.primary,
      justifyContent: "center",
      alignItems: "center",
    },

    buttonText: {
      color: C.primaryText,
      fontWeight: "800",
    },

    buttonOutline: {
      flex: 1,
      height: 44,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: C.border,
      justifyContent: "center",
      alignItems: "center",
    },

    buttonOutlineText: {
      color: C.text,
      fontWeight: "700",
    },
  });
}
