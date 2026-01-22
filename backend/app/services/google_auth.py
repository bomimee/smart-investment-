# pip install google-auth
from fastapi import HTTPException, APIRouter
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from backend.app.core.config import WEB_CLIENT_ID

router = APIRouter()

class GoogleLoginBody(BaseModel):
    id_token: str

@router.post("/auth/google")
def google_login(body: GoogleLoginBody):
    print("called google")
    try:
        payload = id_token.verify_oauth2_token(
            body.id_token,
            google_requests.Request(),
            WEB_CLIENT_ID,)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Google ID token")

    # TODO: DB에서 google_sub(또는 email)로 유저 찾고/생성
    # TODO: 우리 서비스용 access token(JWT) 발급해서 리턴
    return {"ok": True, "email": payload.get("email"), "sub": payload.get("sub")}
