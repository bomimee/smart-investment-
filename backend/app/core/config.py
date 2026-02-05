APP_KEY = ""
APP_SECRET = ""
DOMAIN_REAL = "https://openapi.koreainvestment.com:9443"
DOMAIN_VTS = "https://openapivts.koreainvestment.com:29443"
PATH = "/oauth2/Approval"
PATH_DAILY_CHART = "/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice"
WS_URL_REAL = "ws://ops.koreainvestment.com:21000"
WS_URL_MOCK = "ws://ops.koreainvestment.com:31000"

PATH_APPROVAL = "/oauth2/Approval"
# access_token 발급은 별도 endpoint(tokenP)를 쓰는 경우가 일반적이라 아래는 자리만 잡아둠.
PATH_TOKEN = "/oauth2/tokenP"

# 공통 헤더
DEFAULT_CONTENT_TYPE = "application/json; charset=utf-8"
DEFAULT_CUSTTYPE = "P"

OPENAI_API_KEY = ""
GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"

WEB_CLIENT_ID = (
    "1080162791522-m7qtr31gopbd60sbo5q7f8qt41p5i3mv.apps.googleusercontent.com"
)
KAKAO_REST_KEY = ""  # 내 앱의 REST API 키로 변경 필수
kauth_host = "https://kauth.kakao.com"  # 액세스 토큰 요청을 보낼 카카오 인증 서버 주소
kapi_host = "https://kapi.kakao.com"  # 카카오 API 호출 서버 주소

# Massive API Key for US stock data
MASSIVE_API_KEY = ""  # 실제 API 키로 변경 필요
MASSIVE_API_BASE_URL = "https://api.massive.com"  # Polygon.io/Massive API 기본 URL
