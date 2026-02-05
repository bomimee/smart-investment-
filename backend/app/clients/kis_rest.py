import requests
from backend.app.core.config import (
    DOMAIN_REAL, DOMAIN_VTS,
    PATH_DAILY_CHART,
    DEFAULT_CONTENT_TYPE, DEFAULT_CUSTTYPE,

)
from backend.app.schemas.models import DailyChartQueryParam

def _base(is_mock: bool) -> str:
    return DOMAIN_VTS if is_mock else DOMAIN_REAL

def make_rest_headers(
    access_token: str,
    appkey: str,
    appsecret: str,
    tr_id: str,
    custtype: str = DEFAULT_CUSTTYPE,
) -> dict:
    return {
        "content-type": DEFAULT_CONTENT_TYPE,
        "authorization": f"Bearer {access_token}",
        "appkey": appkey,
        "appsecret": appsecret,
        "tr_id": tr_id,
        "custtype": custtype,
    }

class KISRestClient:
    def __init__(self, access_token: str, appkey: str, appsecret: str, is_mock: bool = False):
        self.access_token = access_token
        self.appkey = appkey
        self.appsecret = appsecret
        self.is_mock = is_mock

    def get_daily_chart(self, stock_code: str, start: str, end: str, period: str = "D") -> list[dict]:
        url = f"{_base(self.is_mock)}{PATH_DAILY_CHART}"

        tr_id = "FHKST03010100"  # TODO: 네 문서 기준으로 확정

        headers = make_rest_headers(
            access_token=self.access_token,
            appkey=self.appkey,
            appsecret=self.appsecret,
            tr_id=tr_id,
        )

        params = DailyChartQueryParam(
            FID_COND_MRKT_DIV_CODE="J",
            FID_INPUT_ISCD=stock_code,
            FID_INPUT_DATE_1=start,
            FID_INPUT_DATE_2=end,
            FID_PERIOD_DIV_CODE=period,
            FID_ORG_ADJ_PRC="0",
        ).to_dict()

        resp = requests.get(url, headers=headers, params=params, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        return data.get("output2", [])
