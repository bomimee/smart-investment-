from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from llm import analyze_chart_with_gemini
from kis_rest import KISRestClient
from auth import get_access_token
from config import APP_KEY, APP_SECRET
from signals import to_ohlcv, generate_ma_signals, summarize
from models import AnalyzeRequest
app = FastAPI()

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
    print(analysis)
    return {"code": req.code, "analysis": analysis}

#python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000
