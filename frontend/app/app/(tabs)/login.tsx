import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ImageBackground,
  TextInput,
  Alert,
} from "react-native";
import { useTheme } from "../../provider/ThemeContext";
import { login } from "@/services/auth";
import LoginScreen from "@/components/LoginScreen";
import { loginWithKakao, loginWithNaver } from "@/services/auth";

export default function Login() {
  const { theme, scheme } = useTheme();
  const C = theme.colors;
  const styles = useMemo(() => createStyles(C, scheme), [C, scheme]);
  const [id, setID] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [user, setUser] = useState<string>();
  const [loading, setLoading] = useState(false);
  
  const Container: any = scheme === "dark" ? ImageBackground : View;
  const containerProps =
    scheme === "dark"
      ? { source: theme.backgroundImage, resizeMode: "cover" as const }
      : {};

  const onKakaoPress = async () => {
    try {
      setLoading(true);
      const data = await loginWithKakao();
      if (!data) return;

      const nickname =
        data.nickname ??
        data.profile?.nickname ??
        data.kakao_account?.profile?.nickname;

      if (!nickname) return;

      setUser(nickname);
    } catch (e: any) {
      Alert.alert("카카오 로그인 실패", e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      style={[
        styles.bg,
        { backgroundColor: scheme === "dark" ? "transparent" : C.background },
      ]}
      {...containerProps}
    >
      {!user && (
        <View
          style={[
            styles.card,
            {
              backgroundColor: scheme === "dark" ? "transparent" : C.background,
            },
          ]}
        >
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
          <LoginScreen onKakaoPress={onKakaoPress} onGoogleSuccess={(email) => setUser(email)}/>
        </View>
      )}
      {user && <Text>환영합니다, {user}님</Text>}
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
      backgroundColor: C.card,
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
