from fastapi import FastAPI, Query, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from .llm.llm import analyze_chart_with_gemini, analyze_news_with_gemini
from .clients.kis_rest import KISRestClient
from .clients.massive import get_us_stock_chart
from .services.auth import get_access_token
from .core.config import APP_KEY, APP_SECRET
from .schemas.signals import to_ohlcv, generate_ma_signals, summarize
from .schemas.models import AnalyzeRequest


class RecommendRequest(BaseModel):
    market: str = "KOREA"  # KOREA 또는 US


from .repository.stocks import repo
from contextlib import asynccontextmanager
from pathlib import Path
import json
from .core.json_utils import sanitize_json
from .services.kakao_auth import router as kakao_router
from .services.google_auth import router as google_router
from .services.news_crawler import NewsCrawler

BASE_DIR = Path(__file__).resolve().parent
STOCKS_PATH = BASE_DIR.parent / "data" / "generated" / "stocks.json"


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
    end: str = Query(...),  # YYYYMMDD
    period: str = Query("D"),
    is_mock: bool = Query(False),
    market: str = Query("KOREA"),  # KOREA 또는 US
):
    try:
        if market == "US":
            # 미국 주식 차트 데이터 (Massive API)
            ohlcv = get_us_stock_chart(code, start, end)
        else:
            # 한국 주식 차트 데이터 (한국투자증권)
            # 1) 토큰 + REST 클라이언트
            access_token = get_access_token(APP_KEY, APP_SECRET, is_mock=is_mock)
            rest = KISRestClient(access_token, APP_KEY, APP_SECRET, is_mock=is_mock)
            # 2) 차트 rows 받아오기
            chart_rows = rest.get_daily_chart(
                stock_code=code, start=start, end=end, period=period
            )
            # 3) 프론트용 OHLCV 리스트 변환 (lightweight-charts 포맷)
            ohlcv = to_ohlcv(chart_rows)

        # 4) 과거 BUY/SELL 시그널 여러개 생성 (마커용)
        signals = generate_ma_signals(ohlcv, ma_fast=5, ma_slow=20)
        # 5) 요약
        summary = summarize(ohlcv, signals)
        return {"code": code, "ohlcv": ohlcv, "signals": signals, "summary": summary}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"차트 데이터 로딩 실패: {str(e)}")


@app.post("/api/analyze")
def api_analyze(req: AnalyzeRequest):
    analysis = analyze_chart_with_gemini(
        code=req.code,
        ohlcv=req.ohlcv,
        signals=req.signals or [],
    )
    return {"code": req.code, "analysis": analysis}


@app.get("/api/list")
def api_list(market: str = Query("KOREA")):  # KOREA 또는 US
    if market == "US":
        # 미국 주식 리스트
        us_stocks_path = BASE_DIR.parent / "data" / "generated" / "us_stocks.json"
        if not us_stocks_path.exists():
            raise HTTPException(status_code=404, detail=f"not found: {us_stocks_path}")

        with us_stocks_path.open("r", encoding="utf-8") as f:
            us_data = json.load(f)
            # 심볼과 이름 형식으로 변환
            normalized_data = []
            for item in us_data:
                normalized_data.append(
                    {
                        "code": item["symbol"],
                        "name": item["name"],
                        "sector": item.get("sector", ""),
                        "description": item.get("description", ""),
                    }
                )
            return sanitize_json(normalized_data)
    else:
        # 한국 주식 리스트
        if not STOCKS_PATH.exists():
            raise HTTPException(status_code=404, detail=f"not found: {STOCKS_PATH}")

        with STOCKS_PATH.open("r", encoding="utf-8") as f:
            return sanitize_json(json.load(f))


@app.get("/api/news")
def api_news(market: str = Query("KOREA")):  # KOREA 또는 US
    """
    최신 경제 뉴스를 크롤링하여 반환합니다.
    """
    try:
        # 뉴스 크롤러 인스턴스 생성
        crawler = NewsCrawler()

        if market == "US":
            # 미국 주식 뉴스 (향후 구현) - 지금은 한국 뉴스 반환
            news_list = crawler.get_all_economy_news(limit_per_source=15, focus_us=True)
        else:
            # 한국 주식 뉴스
            news_list = crawler.get_all_economy_news(limit_per_source=15)

        # 각 뉴스 기사 분석 (종목 코드, 키워드 추출)
        analyzed_news = []
        for news_item in news_list:
            analyzed_item = crawler.analyze_news_content(news_item, market=market)
            analyzed_news.append(analyzed_item)

        return {"news": analyzed_news, "total": len(analyzed_news), "market": market}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"뉴스 로딩 실패: {str(e)}")


@app.post("/api/recommend")
def api_recommend(req: RecommendRequest):
    """
    실제 뉴스를 기반으로 종목을 추천합니다.
    """
    try:
        # 뉴스 크롤러 인스턴스 생성
        crawler = NewsCrawler()

        # 시장에 따라 뉴스 데이터 크롤링
        focus_us = req.market == "US"
        news_list = crawler.get_all_economy_news(limit_per_source=10, focus_us=focus_us)

        # 각 뉴스 기사 분석 (종목 코드, 키워드 추출)
        analyzed_news = []
        for news_item in news_list:
            analyzed_item = crawler.analyze_news_content(news_item, market=req.market)
            analyzed_news.append(analyzed_item)

        # LLM을 사용하여 뉴스 기반 종목 추천 분석
        recommendations = analyze_news_with_gemini(analyzed_news, market=req.market)

        return {
            "recommendations": recommendations,
            "analyzed_news_count": len(analyzed_news),
            "market": req.market,
            "analysis_time": "2024-01-27",
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"종목 추천 실패: {str(e)}")


app.include_router(kakao_router)
app.include_router(google_router)
# python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000
# python -m uvicorn backend.app.server:app --reload --host 0.0.0.0 --port 8000
