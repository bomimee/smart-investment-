import React, { useEffect, useMemo } from "react";
import { View, Pressable, Image, StyleSheet, Platform } from "react-native";
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
import Constants from "expo-constants";
WebBrowser.maybeCompleteAuthSession();
type Props = {
  onKakaoPress: () => Promise<void> | void;
  onNaverPress?: () => Promise<void> | void;
  onGoogleSuccess?: (email: string) => void;
};

export default function LoginScreen({ onKakaoPress, onNaverPress, onGoogleSuccess }: Props) {
  const projectNameForProxy =
    Constants.expoConfig?.owner && Constants.expoConfig?.slug
      ? `@${Constants.expoConfig.owner}/${Constants.expoConfig.slug}`
      : undefined;

  const redirectUri =
    Platform.OS === "web"
      ? AuthSession.makeRedirectUri({
          projectNameForProxy,
        } as any)
      : AuthSession.makeRedirectUri();

  const { theme, scheme } = useTheme();
  const C = theme.colors;
  const styles = useMemo(() => createStyles(C, scheme), [C, scheme]);
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    scopes: ["openid", "profile", "email"],
    redirectUri,
    responseType: AuthSession.ResponseType.IdToken,
  });

  useEffect(() => {
    (async () => {
      if (response?.type !== "success") return;
      const idToken =
      response?.authentication?.idToken ??
      (response as any)?.params?.id_token;
      if (!idToken) return;
     const res = await fetch(`${API_BASE}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: idToken }),
      });

      if (!res.ok) return;
      const data = await res.json();
      const email = data?.email;
      if (email) onGoogleSuccess?.(email); 
    })();
  }, [response]);

  const loginWithGoogle = () => {
    Platform.OS === "web"
      ? promptAsync({ projectNameForProxy } as any)
      : promptAsync();
  };

  return (
    <View style={styles.socialContainer}>
      <Pressable
        disabled={!request}
        onPress={loginWithGoogle}
        style={styles.imageGoogleBtn}
      >
        <Image
          source={require("@/assets/images/google.png")}
          style={styles.imageBtnImg}
        />
      </Pressable>

      <Pressable onPress={onKakaoPress} style={styles.imageBtn}>
        <Image
          source={require("@/assets/images/kakao.png")}
          style={styles.imageBtnImg}
        />
      </Pressable>

      <Pressable onPress={onNaverPress ?? onNaverPress} style={styles.imageBtn}>
        <Image
          source={require("@/assets/images/naver.png")}
          style={styles.imageBtnImg}
        />
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
