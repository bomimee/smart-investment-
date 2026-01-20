from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from backend.app.llm.llm import analyze_chart_with_gemini
from backend.app.clients.kis_rest import KISRestClient
from backend.app.services.auth import get_access_token
from backend.app.core.config import APP_KEY, APP_SECRET
from backend.app.schemas.signals import to_ohlcv, generate_ma_signals, summarize
from backend.app.schemas.models import AnalyzeRequest
from .repository.stocks import repo
from contextlib import asynccontextmanager
from pathlib import Path
import json
from backend.app.core.json_utils import sanitize_json

BASE_DIR = Path(__file__).resolve().parent   
STOCKS_PATH = BASE_DIR.parent / "data" /"generated" / "stocks.json"  

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    repo.load()
    yield
    # Shutdown (optional)
    # repo.close()  # or whatever cleanup you need

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/chart")
def api_chart(
    code: str = Query(...),
    start: str = Query(...),  # YYYYMMDD
    end: str = Query(...),    # YYYYMMDD
    period: str = Query("D"),
    is_mock: bool = Query(False),
):
    # 1) 토큰 + REST 클라이언트
    access_token = get_access_token(APP_KEY, APP_SECRET, is_mock=is_mock)
    rest = KISRestClient(access_token, APP_KEY, APP_SECRET, is_mock=is_mock)
    # 2) 차트 rows 받아오기
    chart_rows = rest.get_daily_chart(stock_code=code, start=start, end=end, period=period)
    # 3) 프론트용 OHLCV 리스트 변환 (lightweight-charts 포맷)
    ohlcv = to_ohlcv(chart_rows)  
    # 4) 과거 BUY/SELL 시그널 여러개 생성 (마커용)
    signals = generate_ma_signals(ohlcv, ma_fast=5, ma_slow=20)  
    # 5) 요약
    summary = summarize(ohlcv, signals)
    return {"code": code, "ohlcv": ohlcv, "signals": signals, "summary": summary}

@app.post("/api/analyze")
def api_analyze(req: AnalyzeRequest):
    analysis = analyze_chart_with_gemini(
        code=req.code,
        ohlcv=req.ohlcv,
        signals=req.signals or [],
    )
    return {"code": req.code, "analysis": analysis}

@app.get("/api/list")
def api_list():
    if not STOCKS_PATH.exists():
        raise HTTPException(status_code=404, detail=f"not found: {STOCKS_PATH}")

    with STOCKS_PATH.open("r", encoding="utf-8") as f:
        return sanitize_json(json.load(f))
    
#python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000
#python -m uvicorn backend.app.server:app --reload --host 0.0.0.0 --port 8000

# 또는 프로젝트 실행/패키지 구조에 따라:
# from backend.app.core.json_utils import sanitize_json

# ...
