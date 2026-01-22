# backend/app/services/kakao_auth.py
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.app.core.config import KAKAO_REST_KEY

router = APIRouter()

class KakaoLoginBody(BaseModel):
    code: str
    redirectUri: str
    # PKCE 쓰면 추후:
    codeVerifier: str | None

@router.post("/auth/kakao")
async def kakao_login(body: KakaoLoginBody):
    print("called")
    if not KAKAO_REST_KEY:
        raise HTTPException(status_code=500, detail="Server misconfigured: KAKAO_REST_KEY missing")

    token_url = "https://kauth.kakao.com/oauth/token"
    token_data = {
        "grant_type": "authorization_code",
        "client_id": KAKAO_REST_KEY,
        "redirect_uri": body.redirectUri,
        "code": body.code,
        # "code_verifier": body.codeVerifier,
    }
    if body.codeVerifier:
        token_data["code_verifier"] = body.codeVerifier

    async with httpx.AsyncClient(timeout=10) as client:
        token_res = await client.post(
            token_url,
            data=token_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

    if token_res.status_code != 200:
        raise HTTPException(status_code=401, detail={"kakao_token_error": token_res.text})

    token_json = token_res.json()
    access_token = token_json.get("access_token")
    if not access_token:
        raise HTTPException(status_code=401, detail={"kakao_token_error": token_json})

    me_url = "https://kapi.kakao.com/v2/user/me"
    async with httpx.AsyncClient(timeout=10) as client:
        me_res = await client.get(me_url, headers={"Authorization": f"Bearer {access_token}"})

    if me_res.status_code != 200:
        raise HTTPException(status_code=401, detail={"kakao_me_error": me_res.text})

    me = me_res.json()
    kakao_account = me.get("kakao_account", {})
    profile = kakao_account.get("profile", {})

    return {
        "provider": "kakao",
        "kakao_id": me.get("id"),
        "email": kakao_account.get("email"),
        "nickname": profile.get("nickname"),
        "token": token_json,
    }
