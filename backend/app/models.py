from dataclasses import dataclass, asdict
from typing import Optional, Literal
from typing import Any, Dict, List, Optional, Literal
from pydantic import BaseModel

class AnalyzeRequest(BaseModel):
    code: str
    ohlcv: List[Dict[str, Any]]          # [{"time","open","high","low","close","volume"}...]
    signals: Optional[List[Dict[str, Any]]] = None  # [{"time","type","price"}...]
    
@dataclass(kw_only=True)
class ApprovalRequestBody:
    grant_type: Literal["client_credentials"] = "client_credentials"
    appkey: str = ""
    secretkey: str = ""

    def to_dict(self) -> dict:
        return asdict(self)

@dataclass(kw_only=True)
class TokenRequestBody:
    # 보통 tokenP는 appsecret 키 이름을 씀 (approval의 secretkey와 다름)
    grant_type: Literal["client_credentials"] = "client_credentials"
    appkey: str = ""
    appsecret: str = ""

    def to_dict(self) -> dict:
        return asdict(self)

@dataclass(kw_only=True)
class DailyChartQueryParam:
    FID_COND_MRKT_DIV_CODE: str   # 예: "J"
    FID_INPUT_ISCD: str           # 예: "005930"
    FID_INPUT_DATE_1: str         # 예: "20240101"
    FID_INPUT_DATE_2: str         # 예: "20240114"
    FID_PERIOD_DIV_CODE: str      # 예: "D"
    FID_ORG_ADJ_PRC: str = "0"

    def to_dict(self) -> dict:
        return asdict(self)

@dataclass(kw_only=True)
class WsSubscribeInput:
    tr_id: str
    tr_key: str

    def to_msg(self, approval_key: str, custtype: str = "P", tr_type: str = "1") -> dict:
        # websocket 구독 메시지 형태(등록: tr_type="1", 해제: "2")
        return {
            "header": {
                "approval_key": approval_key,
                "custtype": custtype,
                "tr_type": tr_type,
                "content-type": "utf-8",
            },
            "body": {"input": {"tr_id": self.tr_id, "tr_key": self.tr_key}},
        }
