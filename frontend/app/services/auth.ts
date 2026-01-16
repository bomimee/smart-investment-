import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import {
  API_BASE,
  KAKAO_REST_KEY,
} from "@/config/env";

WebBrowser.maybeCompleteAuthSession();

export async function loginWithKakao() {
 if (!KAKAO_REST_KEY) throw new Error("Missing EXPO_PUBLIC_KAKAO_REST_KEY");
  if (!API_BASE) throw new Error("Missing EXPO_PUBLIC_API_BASE");

  // ✅ Expo Go / Dev Client / Standalone 모두 안전한 redirectUri 생성
  const redirectUri = AuthSession.makeRedirectUri({
    // useProxy는 버전에 따라 타입이 없거나 동작이 달라서,
    // 필요하면 아래처럼 "projectNameForProxy"로 안전하게 처리하는 편이 낫습니다.
    // projectNameForProxy: "@yourname/yourapp",
  });
console.log("redirectUri =", redirectUri);
  const authUrl =
    "https://kauth.kakao.com/oauth/authorize" +
    `?client_id=${encodeURIComponent(KAKAO_REST_KEY)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code`;
console.log("authUrl URL =", authUrl);
  // ✅ startAsync 대신 AuthRequest 사용
  const request = new AuthSession.AuthRequest({
    clientId: KAKAO_REST_KEY,
    redirectUri,
    responseType: AuthSession.ResponseType.Code,
  });

  const result = await request.promptAsync({
  authorizationEndpoint: "https://kauth.kakao.com/oauth/authorize",
});
console.log("AUTH URL =", request?.url);
  if (result.type !== "success") return null;

  const code = (result.params as any)?.code;
  if (!code) throw new Error("Kakao: no code returned");

  const res = await fetch(`${API_BASE}/auth/kakao`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, redirectUri }),
  });

  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}
export async function loginWithNaver() {console.log("naver")}
export async function login() {console.log("naver")}