import os
import httpx
from fastapi import HTTPException, APIRouter
from pydantic import BaseModel
from config import KAKAO_REST_KEY

router = APIRouter()

if not KAKAO_REST_KEY:
    # 개발 편의: 없으면 에러로 알려주기
    print("⚠️ Missing KAKAO_REST_KEY env var")

class KakaoLoginBody(BaseModel):
    code: str
    redirectUri: str  # 프론트에서 받은 redirectUri 그대로 써야 함(중요)

@app.post("/auth/kakao")
async def kakao_login(body: KakaoLoginBody):
    print("called")
    if not KAKAO_REST_KEY:
        raise HTTPException(status_code=500, detail="Server misconfigured: KAKAO_REST_KEY missing")

    # 1) code -> token 교환
    token_url = "https://kauth.kakao.com/oauth/token"
    token_data = {
        "grant_type": "authorization_code",
        "client_id": KAKAO_REST_KEY,
        "redirect_uri": body.redirectUri,
        "code": body.code,
        # 프론트가 PKCE(code_challenge)로 요청했다면, verifier가 필요할 수 있음 (아래 설명 참고)
        # "code_verifier": body.codeVerifier,
    }

    async with httpx.AsyncClient(timeout=10) as client:
        token_res = await client.post(
            token_url,
            data=token_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

    if token_res.status_code != 200:
        # 카카오가 주는 에러 그대로 확인하기 좋게 반환
        raise HTTPException(status_code=401, detail={"kakao_token_error": token_res.text})

    token_json = token_res.json()
    access_token = token_json.get("access_token")
    if not access_token:
        raise HTTPException(status_code=401, detail={"kakao_token_error": token_json})

    # 2) access_token으로 사용자 정보 조회
    me_url = "https://kapi.kakao.com/v2/user/me"
    async with httpx.AsyncClient(timeout=10) as client:
        me_res = await client.get(
            me_url,
            headers={"Authorization": f"Bearer {access_token}"},
        )

    if me_res.status_code != 200:
        raise HTTPException(status_code=401, detail={"kakao_me_error": me_res.text})

    me = me_res.json()

    kakao_id = me.get("id")
    kakao_account = me.get("kakao_account", {})
    profile = kakao_account.get("profile", {})
    email = kakao_account.get("email")
    nickname = profile.get("nickname")

    # 3) 여기서부터는 "너 서비스 로직"
    # - kakao_id로 유저 조회/가입
    # - JWT 발급
    # 예시로는 그냥 데이터 반환
    return {
        "provider": "kakao",
        "kakao_id": kakao_id,
        "email": email,
        "nickname": nickname,
        "token": token_json,   # 개발 중엔 확인용, 실제 운영에서는 내려주지 말 것
    }
