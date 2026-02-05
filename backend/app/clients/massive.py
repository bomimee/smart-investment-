import requests
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from ..core.config import MASSIVE_API_KEY


class MassiveClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.massive.com"
        self.use_dummy_data = MASSIVE_API_KEY == "DUMMY_MODE"  # Dummy mode for testing

    def _get_dummy_chart_data(
        self,
        symbol: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """더미 차트 데이터 생성"""
        # 기본 날짜 범위 설정
        if not end_date:
            end_date = datetime.now().strftime("%Y%m%d")
        if not start_date:
            start_date = (datetime.now() - timedelta(days=30)).strftime("%Y%m%d")

        # 샘플 데이터 생성
        dummy_data = []
        current_date = datetime.strptime(start_date, "%Y%m%d")
        end_dt = datetime.strptime(end_date, "%Y%m%d")

        base_price = 150.0  # 기본 가격

        while current_date <= end_dt:
            # 간단한 가변 데이터 생성
            price_change = (hash(current_date.strftime("%Y%m%d")) % 20 - 10) * 0.5
            open_price = base_price + price_change
            close_price = (
                open_price + (hash(current_date.strftime("%Y%m%d")) % 10 - 5) * 0.3
            )
            high_price = max(open_price, close_price) + 2.0
            low_price = min(open_price, close_price) - 1.5
            volume = 50000000 + (hash(current_date.strftime("%Y%m%d")) % 20000000)

            dummy_data.append(
                {
                    "time": current_date.strftime("%Y%m%d"),
                    "open": round(open_price, 2),
                    "high": round(high_price, 2),
                    "low": round(low_price, 2),
                    "close": round(close_price, 2),
                    "volume": volume,
                }
            )

            current_date += timedelta(days=1)
            base_price = close_price

        return dummy_data

    def get_daily_chart(
        self,
        symbol: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        미국 주식 일봉 차트 데이터 조회

        Args:
            symbol: 주식 심볼 (예: "AAPL")
            start_date: 시작일 (YYYY-MM-DD 형식, 선택사항)
            end_date: 종료일 (YYYY-MM-DD 형식, 선택사항)

        Returns:
            OHLCV 데이터 리스트
        """
        # Dummy mode for testing when API key is invalid
        if self.use_dummy_data:
            return self._get_dummy_chart_data(symbol, start_date, end_date)

        # 기본 날짜 범위 설정 (최근 30일)
        if not end_date:
            end_date = datetime.now().strftime("%Y-%m-%d")
        if not start_date:
            start_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")

        # 날짜 형식 변환 (YYYY-MM-DD -> YYYY-MM-DD)
        url = f"{self.base_url}/v2/aggs/ticker/{symbol}/range/1/day/{start_date}/{end_date}"

        headers = {
            "Content-Type": "application/json",
        }

        params = {
            "adjusted": "true",
            "sort": "asc",
            "limit": 5000,
            "apiKey": self.api_key,
        }

        try:
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()

            # API 오류 처리
            if "results" not in data:
                raise Exception(f"종목 {symbol} 데이터를 찾을 수 없습니다")

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
            raise Exception(f"Massive API 호출 실패: {str(e)}")
        except Exception as e:
            raise Exception(f"차트 데이터 처리 실패: {str(e)}")

    def _get_dummy_quote_data(self, symbol: str) -> Dict[str, Any]:
        """더미 실시간 데이터 생성"""
        import random

        base_price = 150.0 + random.uniform(-20, 50)
        return {
            "symbol": symbol,
            "price": round(base_price, 2),
            "change": round(random.uniform(-5, 5), 2),
            "change_percent": f"{random.uniform(-3, 3):.2f}%",
            "volume": 50000000 + random.randint(-10000000, 10000000),
            "latest_trading_day": datetime.now().strftime("%Y-%m-%d"),
        }

    def _get_dummy_search_results(self, keywords: str) -> List[Dict[str, str]]:
        """더미 검색 결과 생성"""
        dummy_results = []

        if "apple" in keywords.lower():
            dummy_results.append(
                {
                    "symbol": "AAPL",
                    "name": "Apple Inc.",
                    "type": "stock",
                    "region": "US",
                    "currency": "USD",
                }
            )

        if "microsoft" in keywords.lower():
            dummy_results.append(
                {
                    "symbol": "MSFT",
                    "name": "Microsoft Corporation",
                    "type": "stock",
                    "region": "US",
                    "currency": "USD",
                }
            )

        if "google" in keywords.lower() or "alphabet" in keywords.lower():
            dummy_results.append(
                {
                    "symbol": "GOOGL",
                    "name": "Alphabet Inc.",
                    "type": "stock",
                    "region": "US",
                    "currency": "USD",
                }
            )

        return dummy_results

    def search_symbol(self, keywords: str) -> List[Dict[str, str]]:
        """
        주식 심볼 검색

        Args:
            keywords: 검색 키워드

        Returns:
            검색 결과 리스트
        """
        # Dummy mode for testing
        if self.use_dummy_data:
            return self._get_dummy_search_results(keywords)

        url = f"{self.base_url}/v3/reference/tickers"

        headers = {
            "Content-Type": "application/json",
        }

        params = {
            "search": keywords,
            "active": "true",
            "market": "stocks",
            "limit": 10,
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
        # Dummy mode for testing
        if self.use_dummy_data:
            return self._get_dummy_quote_data(symbol)

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
        if api_key == "YOUR_MASSIVE_API_KEY_HERE":
            raise Exception(
                "MASSIVE_API_KEY가 설정되지 않았습니다. 환경변수를 설정해주세요"
            )
        _massive_client = MassiveClient(api_key)
    return _massive_client


def get_us_stock_chart(
    symbol: str, start_date: Optional[str] = None, end_date: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    미국 주식 차트 데이터 조회 (헬퍼 함수)
    """
    client = get_massive_client()
    return client.get_daily_chart(symbol, start_date, end_date)
