import os
import json
import re
from typing import Any, Dict, List, Optional
from google import genai
from backend.app.llm.prompts import CHART_ANALYSIS_PROMPT, NEWS_ANALYSIS_PROMPT
from backend.app.core.config import OPENAI_API_KEY


def _extract_json(text: str) -> Optional[str]:
    if not text:
        return None
    # 코드블록 제거
    text = re.sub(r"^```(?:json)?\s*", "", text.strip())
    text = re.sub(r"\s*```$", "", text.strip())
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1:
        return None
    return text[start : end + 1]


def analyze_chart_with_gemini(
    code: str,
    ohlcv: List[Dict[str, Any]],
    signals: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    api_key = OPENAI_API_KEY
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY(또는 GOOGLE_API_KEY) 환경변수를 설정해줘.")

    client = genai.Client(api_key=api_key)

    payload = {
        "code": code,
        "ohlcv": ohlcv[-200:],  # 최근 200봉
        "signals": (signals or [])[-5:],  # 최근 5개 신호
    }

    prompt = f"""
{CHART_ANALYSIS_PROMPT}

반드시 JSON만 출력해. 다른 텍스트/마크다운/설명 금지.

INPUT_DATA_JSON:
{json.dumps(payload, ensure_ascii=False)}
""".strip()

    # ✅ 모델은 계정/권한에 따라 다를 수 있어. 우선 많이 쓰는 2개 중 하나로 시작.
    # - "gemini-2.0-flash" (빠름)
    # - "gemini-1.5-flash" (호환 넓음)
    model = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")

    resp = client.models.generate_content(
        model=model,
        contents=prompt,
        # temperature 같은 generation config도 가능
        # config=genai.types.GenerateContentConfig(temperature=0.3)
    )

    text = resp.text or ""
    cleaned = _extract_json(text)
    if not cleaned:
        return {"error": "No JSON returned", "raw_output": text}

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        return {
            "error": "JSON parsing failed",
            "exception": str(e),
            "raw_output": cleaned,
        }


def analyze_news_with_gemini(
    news_articles: List[Dict[str, Any]], market: str = "KOREA"
) -> Dict[str, Any]:
    """
    뉴스 기사들을 분석하여 종목 추천을 생성합니다.
    """
    api_key = OPENAI_API_KEY
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY(또는 GOOGLE_API_KEY) 환경변수를 설정해줘.")

    client = genai.Client(api_key=api_key)

    # 뉴스 기사들을 텍스트로 변환
    news_text = ""
    for i, article in enumerate(news_articles[:15]):  # 최대 15개 기사 분석
        news_text += f"{i + 1}. 제목: {article.get('title', '')}\n"
        news_text += f"   요약: {article.get('summary', '')}\n"
        news_text += f"   언론사: {article.get('press', '')}\n"
        news_text += (
            f"   관련 종목: {', '.join(article.get('extracted_stocks', []))}\n\n"
        )

    # 시장에 따라 다른 프롬프트 사용
    if market == "US":
        prompt = f"""
You are analyzing US stock market news to provide investment recommendations.

{NEWS_ANALYSIS_PROMPT}

Focus on US stocks and market dynamics. Consider American companies listed on NASDAQ, NYSE, and other US exchanges.

MARKET: US STOCKS

반드시 JSON만 출력해. 다른 텍스트/마크다운/설명 금지.

NEWS_DATA:
{news_text}
""".strip()
    else:
        prompt = f"""
{NEWS_ANALYSIS_PROMPT}

Focus on Korean stocks and market dynamics. Consider companies listed on KOSPI and KOSDAQ.

MARKET: KOREAN STOCKS

반드시 JSON만 출력해. 다른 텍스트/마크다운/설명 금지.

NEWS_DATA:
{news_text}
""".strip()

    model = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")

    resp = client.models.generate_content(
        model=model,
        contents=prompt,
    )

    text = resp.text or ""
    cleaned = _extract_json(text)
    if not cleaned:
        return {"error": "No JSON returned", "raw_output": text}

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        return {
            "error": "JSON parsing failed",
            "exception": str(e),
            "raw_output": cleaned,
        }
