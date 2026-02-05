import requests
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from ..core.config import MASSIVE_API_KEY, MASSIVE_API_BASE_URL


class MassiveClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = MASSIVE_API_BASE_URL

    def get_daily_chart(
        self,
        symbol: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        # 날짜 형식 변환: YYYYMMDD -> YYYY-MM-DD (Polygon API 형식)
        if end_date and len(end_date) == 8:  # YYYYMMDD 형식이면 변환
            end_date = f"{end_date[:4]}-{end_date[4:6]}-{end_date[6:8]}"
        if start_date and len(start_date) == 8:  # YYYYMMDD 형식이면 변환
            start_date = f"{start_date[:4]}-{start_date[4:6]}-{start_date[6:8]}"

        # 기본 날짜 범위 설정 (최근 30일)
        if not end_date:
            end_date = datetime.now().strftime("%Y-%m-%d")
        if not start_date:
            start_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")

        # 날짜 형식 변환 (YYYY-MM-DD -> YYYY-MM-DD)
        url = f"{self.base_url}/v2/aggs/ticker/{symbol}/range/1/day/{start_date}/{end_date}"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
        }

        params = {
            "adjusted": "true",
            "sort": "asc",
            "limit": 5000,
            "apikey": self.api_key,
        }

        try:
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()

            # API 오류 처리
            if "results" not in data:
                raise Exception(f"종목 {symbol} 데이터를 찾을 수 없습니다: {data}")

            ohlcv_data = []
            for item in data["results"]:
                # Unix 타임스탬프를 날짜 문자열로 변환
                timestamp = item["t"] / 1000  # 밀리초를 초로 변환
                date_str = datetime.fromtimestamp(timestamp).strftime("%Y%m%d")

                ohlcv = {
                    "time": date_str,
                    "open": float(item["o"]),
                    "high": float(item["h"]),
                    "low": float(item["l"]),
                    "close": float(item["c"]),
                    "volume": int(item["v"]),
                }
                ohlcv_data.append(ohlcv)

            return ohlcv_data

        except requests.exceptions.RequestException as e:
            error_response = (
                e.response.text if hasattr(e, "response") and e.response else str(e)
            )
            raise Exception(f"Massive API 호출 실패: {str(e)} - 응답: {error_response}")
        except Exception as e:
            raise Exception(f"차트 데이터 처리 실패: {str(e)}")

    def search_symbol(self, keywords: str) -> List[Dict[str, str]]:

        url = f"{self.base_url}/v3/reference/tickers"

        headers = {
            "Content-Type": "application/json",
        }

        params = {
            "search": keywords,
            "active": "true",
            "market": "stocks",
            "apiKey": self.api_key,
        }

        try:
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()

            if "status" in data and data["status"] != "OK":
                raise Exception(
                    f"Massive API Error: {data.get('error', 'Unknown error')}"
                )
            if "results" not in data:
                return []

            matches = []
            for item in data["results"]:
                matches.append(
                    {
                        "symbol": item["ticker"],
                        "name": item["name"],
                        "type": "stock",
                        "region": "US",
                        "currency": "USD",
                    }
                )

            return matches

        except requests.exceptions.RequestException as e:
            raise Exception(f"Massive API 호출 실패: {str(e)}")
        except Exception as e:
            raise Exception(f"심볼 검색 실패: {str(e)}")

    def get_quote(self, symbol: str) -> Dict[str, Any]:
        """
        실시간 주식 정보 조회

        Args:
            symbol: 주식 심볼

        Returns:
            주식 정보 딕셔너리
        """

        url = f"{self.base_url}/v2/aggs/ticker/{symbol}/prev"

        headers = {
            "Content-Type": "application/json",
        }

        params = {"adjusted": "true", "apiKey": self.api_key}

        try:
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()

            if "status" in data and data["status"] != "OK":
                raise Exception(
                    f"Massive API Error: {data.get('error', 'Unknown error')}"
                )
            if "results" not in data or not data["results"]:
                raise Exception(f"종목 {symbol} 정보를 찾을 수 없습니다")

            quote = data["results"][0]
            return {
                "symbol": symbol,
                "price": float(quote["c"]),
                "change": float(quote.get("change", 0)),
                "change_percent": f"{quote.get('change_percent', 0):.2f}%",
                "volume": int(quote["v"]),
                "latest_trading_day": datetime.fromtimestamp(
                    quote["t"] / 1000
                ).strftime("%Y-%m-%d"),
            }

        except requests.exceptions.RequestException as e:
            raise Exception(f"Massive API 호출 실패: {str(e)}")
        except Exception as e:
            raise Exception(f"주식 정보 조회 실패: {str(e)}")


# 전역 클라이언트 인스턴스
_massive_client = None


def get_massive_client() -> MassiveClient:
    """
    Massive 클라이언트 인스턴스를 반환합니다.
    """
    global _massive_client
    if _massive_client is None:
        # 환경 변수 또는 설정 파일에서 API 키 가져오기
        api_key = MASSIVE_API_KEY
        _massive_client = MassiveClient(api_key)
    return _massive_client


def get_us_stock_chart(
    symbol: str, start_date: Optional[str] = None, end_date: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    미국 주식 차트 데이터 조회 (헬퍼 함수)
    """
    client = get_massive_client()
    print(client.get_daily_chart(symbol, start_date, end_date))
    return client.get_daily_chart(symbol, start_date, end_date)
