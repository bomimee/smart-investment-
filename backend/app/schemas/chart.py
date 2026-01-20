# analyzer.py
from indicators import sma, rsi

def analyze_from_chart(stock_code: str, chart_rows: list[dict]) -> dict:
    """
    chart_rows에서 종가를 뽑아 간단 신호 생성.
    (응답 필드명은 실제 KIS output2의 종가 키에 맞춰 바꿔야 함)
    """
    # TODO: 종가 필드명 확인 후 수정 (예: "stck_clpr" 같은 키일 수 있음)
    closes = []
    for row in chart_rows:
        v = row.get("stck_clpr") or row.get("close")  # 임시 fallback
        if v is None:
            continue
        try:
            closes.append(float(v))
        except:
            pass

    if len(closes) < 30:
        return {"stock": stock_code, "signal": "HOLD", "confidence": 0.2, "reasons": ["데이터가 충분하지 않음"]}

    ma5 = sma(closes, 5)[-1]
    ma20 = sma(closes, 20)[-1]
    r = rsi(closes, 14)[-1]
    last = closes[-1]

    reasons = []
    signal = "HOLD"
    confidence = 0.5

    if last > ma20 and ma5 > ma20 and r < 70:
        signal = "BUY"
        confidence = 0.65
        reasons.append("단기/중기 이동평균 정배열")
        reasons.append(f"RSI={r:.1f} (과열 아님)")
    elif last < ma20 and ma5 < ma20 and r > 30:
        signal = "SELL"
        confidence = 0.60
        reasons.append("단기/중기 이동평균 역배열")
        reasons.append(f"RSI={r:.1f} (과매도 아님)")
    else:
        reasons.append("추세가 애매하거나 과열/과매도 구간")

    return {"stock": stock_code, "signal": signal, "confidence": confidence, "reasons": reasons}
