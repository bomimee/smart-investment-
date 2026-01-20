import pandas as pd

def to_ohlcv(rows: list[dict]) -> list[dict]:
    df = pd.DataFrame(rows).copy()
    df["time"] = pd.to_datetime(df["stck_bsop_date"].astype(str), format="%Y%m%d", errors="coerce")
    for c in ["stck_oprc", "stck_hgpr", "stck_lwpr", "stck_clpr", "acml_vol"]:
        df[c] = pd.to_numeric(df[c], errors="coerce")
    df = df.dropna(subset=["time","stck_oprc","stck_hgpr","stck_lwpr","stck_clpr"]).sort_values("time")

    # lightweight-charts 포맷: time은 "YYYY-MM-DD" 문자열로 주는 게 가장 편함
    out = []
    for _, r in df.iterrows():
        out.append({
            "time": r["time"].strftime("%Y-%m-%d"),
            "open": float(r["stck_oprc"]),
            "high": float(r["stck_hgpr"]),
            "low": float(r["stck_lwpr"]),
            "close": float(r["stck_clpr"]),
            "volume": float(r.get("acml_vol", 0) or 0),
        })
    return out

def generate_ma_signals(ohlcv: list[dict], ma_fast: int = 5, ma_slow: int = 20) -> list[dict]:
    df = pd.DataFrame(ohlcv)
    if len(df) < ma_slow + 2:
        return []

    df["ma_fast"] = df["close"].rolling(ma_fast).mean()
    df["ma_slow"] = df["close"].rolling(ma_slow).mean()

    cross_up = (df["ma_fast"] > df["ma_slow"]) & (df["ma_fast"].shift(1) <= df["ma_slow"].shift(1))
    cross_dn = (df["ma_fast"] < df["ma_slow"]) & (df["ma_fast"].shift(1) >= df["ma_slow"].shift(1))

    signals = []
    for i in range(len(df)):
        if bool(cross_up.iloc[i]):
            signals.append({"time": df["time"].iloc[i], "type": "BUY", "price": float(df["low"].iloc[i])})
        elif bool(cross_dn.iloc[i]):
            signals.append({"time": df["time"].iloc[i], "type": "SELL", "price": float(df["high"].iloc[i])})
    return signals

def summarize(ohlcv: list[dict], signals: list[dict]) -> dict:
    if not ohlcv:
        return {"latest_close": None, "num_signals": 0, "latest_signal": None}
    latest_close = ohlcv[-1]["close"]
    latest_signal = signals[-1] if signals else None
    return {"latest_close": latest_close, "num_signals": len(signals), "latest_signal": latest_signal}
