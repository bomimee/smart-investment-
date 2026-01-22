import React, { useEffect, useMemo } from "react";
import { View, Pressable, Image, Alert, StyleSheet } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import { useTheme } from "@/provider/ThemeContext";
import {
  API_BASE,
  GOOGLE_WEB_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_ANDROID_CLIENT_ID,
} from "@/config/env";


WebBrowser.maybeCompleteAuthSession();
type Props = {
  onKakaoPress: () => Promise<void> | void;
  onNaverPress?: () => Promise<void> | void;
};

export default function LoginScreen({ onKakaoPress, onNaverPress }: Props) {
  const { theme, scheme } = useTheme();
  const C = theme.colors;
  const styles = useMemo(() => createStyles(C, scheme), [C, scheme]);

  const redirectUri = AuthSession.makeRedirectUri();
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    scopes: ["openid", "profile", "email"],
    redirectUri,
  });

  useEffect(() => {
    (async () => {
      if (response?.type !== "success") return;

      const idToken = response.authentication?.idToken;
      if (!idToken) return;

      const res = await fetch(`${API_BASE}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: idToken }),
      });

      if (!res.ok) return;

      const data = await res.json();
      console.log("구글 로그인 성공:", data);
    })();
  }, [response]);

  const loginWithGoogle = () => promptAsync();

  return (
    <View style={styles.socialContainer}>
      <Pressable disabled={!request} onPress={loginWithGoogle} style={styles.imageGoogleBtn}>
        <Image source={require("@/assets/images/google.png")} style={styles.imageBtnImg} />
      </Pressable>

      <Pressable onPress={onKakaoPress} style={styles.imageBtn}>
        <Image source={require("@/assets/images/kakao.png")} style={styles.imageBtnImg} />
      </Pressable>

      <Pressable
        onPress={onNaverPress ?? onNaverPress}
        style={styles.imageBtn}
      >
        <Image source={require("@/assets/images/naver.png")} style={styles.imageBtnImg} />
      </Pressable>
    </View>
  );
}

function createStyles(C: any, scheme: "light" | "dark") {
  const isDark = scheme === "dark";
  return StyleSheet.create({
    socialContainer: {
      marginTop: 24,
      flexDirection: "row",
      gap: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    imageBtn: {
      width: 50,
      height: 50,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
      backgroundColor: C.background,
    },
    imageGoogleBtn: {
      width: 50,
      height: 50,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
      backgroundColor: "white",
    },
    imageBtnImg: {
      width: "100%",
      height: "100%",
      resizeMode: "contain",
    },
    label: {
      fontSize: 12,
      margin: 6,
      opacity: 0.9,
      color: isDark ? C.textMuted : C.textMuted,
      fontWeight: "600",
    },
  });
}
