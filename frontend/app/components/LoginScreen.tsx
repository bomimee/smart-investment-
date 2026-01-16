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

import { loginWithKakao, loginWithNaver } from "@/services/auth";
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { theme, scheme } = useTheme();
  const C = theme.colors;
  const styles = useMemo(() => createStyles(C, scheme), [C, scheme]);

  // ✅ 일단 useProxy 제거
  const redirectUri = AuthSession.makeRedirectUri();

  console.log("redirectUri =", redirectUri);
  console.log("GOOGLE_WEB_CLIENT_ID =", GOOGLE_WEB_CLIENT_ID);
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    scopes: ["openid", "profile", "email"],
    redirectUri,
  });
  useEffect(() => {
    console.log("AUTH URL =", request?.url);
  }, [request]);

  useEffect(() => {
    (async () => {
      if (response?.type !== "success") return;

      const idToken = response.authentication?.idToken;
      if (!idToken) {
        Alert.alert("Google 로그인 실패", "idToken을 받지 못했어요.");
        return;
      }

      const res = await fetch(`${API_BASE}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: idToken }),
      });

      if (!res.ok) {
        Alert.alert("로그인 실패", await res.text());
        return;
      }

      const data = await res.json();
      console.log("로그인 성공:", data);
    })();
  }, [response]);

  const loginWithGoogle = () => promptAsync();
  return (
    <View style={styles.socialContainer}>
      <Pressable
        disabled={!request}
        onPress={loginWithGoogle}
        style={styles.imageBtn}
      >
        <Image
          source={require("@/assets/images/google.png")}
          style={styles.imageBtnImg}
        />
      </Pressable>

      <Pressable onPress={loginWithKakao} style={styles.imageBtn}>
        <Image
          source={require("@/assets/images/kakao.png")}
          style={styles.imageBtnImg}
        />
      </Pressable>

      <Pressable onPress={loginWithNaver} style={styles.imageBtn}>
        <Image
          source={require("@/assets/images/naver.png")}
          style={styles.imageBtnImg}
        />
      </Pressable>
    </View>
  );
}

function createStyles(C: any, scheme: "light" | "dark") {
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
      borderRadius: 12,
      borderWidth: 1,
      borderColor: C.border,
      overflow: "hidden",
      backgroundColor: C.card,
    },
    imageBtnImg: {
      width: "100%",
      height: "100%",
      resizeMode: "contain",
    },
  });
}
