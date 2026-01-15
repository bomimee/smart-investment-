# indicators.py
from typing import Iterable

def sma(values: list[float], window: int) -> list[float]:
    if window <= 0:
        raise ValueError("window must be > 0")
    out = []
    s = 0.0
    for i, v in enumerate(values):
        s += v
        if i >= window:
            s -= values[i - window]
        if i >= window - 1:
            out.append(s / window)
        else:
            out.append(float("nan"))
    return out

def rsi(values: list[float], window: int = 14) -> list[float]:
    # 아주 기본 RSI
    if len(values) < window + 1:
        return [float("nan")] * len(values)

    gains = [0.0]
    losses = [0.0]
    for i in range(1, len(values)):
        diff = values[i] - values[i - 1]
        gains.append(max(diff, 0.0))
        losses.append(max(-diff, 0.0))

    out = [float("nan")] * len(values)
    avg_gain = sum(gains[1:window+1]) / window
    avg_loss = sum(losses[1:window+1]) / window

    def calc(ag, al):
        if al == 0:
            return 100.0
        rs = ag / al
        return 100.0 - (100.0 / (1.0 + rs))

    out[window] = calc(avg_gain, avg_loss)

    for i in range(window + 1, len(values)):
        avg_gain = (avg_gain * (window - 1) + gains[i]) / window
        avg_loss = (avg_loss * (window - 1) + losses[i]) / window
        out[i] = calc(avg_gain, avg_loss)

    return out
