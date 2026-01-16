# pip install google-auth
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

WEB_CLIENT_ID = "너의-web-client-id.apps.googleusercontent.com"

app = FastAPI()

class GoogleLoginBody(BaseModel):
    id_token: str

@app.post("/auth/google")
def google_login(body: GoogleLoginBody):
    try:
        info = id_token.verify_oauth2_token(
            body.id_token,
            google_requests.Request(),
            WEB_CLIENT_ID,   # audience 체크
        )
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Google ID token")

    # info 예: sub, email, name, picture 등
    google_sub = info["sub"]
    email = info.get("email")

    # TODO: DB에서 google_sub(또는 email)로 유저 찾고/생성
    # TODO: 우리 서비스용 access token(JWT) 발급해서 리턴
    return {"google_sub": google_sub, "email": email}
