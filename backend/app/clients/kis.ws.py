# kis_ws.py
import json
import websocket
from backend.app.core.config import WS_URL_REAL, WS_URL_MOCK, DEFAULT_CUSTTYPE
from backend.app.schemas.models import WsSubscribeInput

def _ws_url(is_mock: bool) -> str:
    return WS_URL_MOCK if is_mock else WS_URL_REAL

def make_on_open(approval_key: str, subs: list[WsSubscribeInput], custtype: str = DEFAULT_CUSTTYPE):
    def on_open(ws):
        for s in subs:
            msg = s.to_msg(approval_key=approval_key, custtype=custtype, tr_type="1")
            ws.send(json.dumps(msg))
        print("subscribe sent:", len(subs))
    return on_open

def make_unsubscribe(ws, approval_key: str, sub: WsSubscribeInput, custtype: str = DEFAULT_CUSTTYPE):
    msg = sub.to_msg(approval_key=approval_key, custtype=custtype, tr_type="2")
    ws.send(json.dumps(msg))

def run_ws(approval_key: str, subs: list[WsSubscribeInput], is_mock: bool = False):
    def on_message(ws, message):
        print("RECV:", message)

    def on_error(ws, error):
        print("WS error:", error)

    def on_close(ws, code, msg):
        print("WS closed:", code, msg)

    ws = websocket.WebSocketApp(
        _ws_url(is_mock),
        on_open=make_on_open(approval_key, subs),
        on_message=on_message,
        on_error=on_error,
        on_close=on_close,
    )
    ws.run_forever(ping_interval=30, ping_timeout=10)
