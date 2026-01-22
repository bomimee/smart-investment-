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

  const redirectUri = AuthSession.makeRedirectUri({});

  const request = new AuthSession.AuthRequest({
  clientId: KAKAO_REST_KEY,
  redirectUri,
  responseType: AuthSession.ResponseType.Code,
  usePKCE: true, // 명시 (기본 true일 때도 있음)
});

const result = await request.promptAsync({
  authorizationEndpoint: "https://kauth.kakao.com/oauth/authorize",
});

if (result.type !== "success") return null;

const code = (result.params as any)?.code;
if (!code) throw new Error("Kakao: no code returned");

const res = await fetch(`${API_BASE}/auth/kakao`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    code,
    redirectUri,
    codeVerifier: request.codeVerifier, // ✅ 추가!
  }),
});

if (!res.ok) throw new Error(await res.text());
return await res.json();
}
export async function loginWithNaver() {console.log("naver")}
export async function login() {console.log("naver")}