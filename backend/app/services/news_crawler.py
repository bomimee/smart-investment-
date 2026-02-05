import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
from typing import List, Dict, Any
import re
import time
from urllib.parse import urljoin


class NewsCrawler:
    def __init__(self):
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        self.session = requests.Session()
        self.session.headers.update(self.headers)

    def get_naver_economy_news(self, limit: int = 20) -> List[Dict[str, Any]]:
        """
        네이버 경제 뉴스를 크롤링합니다.
        """
        news_list = []

        try:
            # RSS 피드를 통해 뉴스 데이터 가져오기
            url = "https://news.naver.com/main/list.naver?mode=LSD&mid=sec&sid1=101"
            response = self.session.get(url, timeout=10)
            response.raise_for_status()

            if response.status_code == 200:
                soup = BeautifulSoup(response.content, "html.parser")

                # 뉴스 기사 목록 찾기
                articles = soup.select("div.type06_headline li")

                for article in articles[:limit]:
                    try:
                        # 제목과 링크 추출
                        title_element = article.select_one(
                            "dt a"
                        ) or article.select_one("dt:not(.photo) a")
                        if not title_element:
                            continue

                        title = title_element.get_text(strip=True)
                        href = str(title_element.get("href") or "")
                        link = urljoin("https://news.naver.com", href)

                        # 요약 내용 추출
                        summary_element = article.select_one("span.lede")
                        summary = (
                            summary_element.get_text(strip=True)
                            if summary_element
                            else ""
                        )

                        # 언론사 정보 추출
                        press_element = article.select_one("span.writing")
                        press = (
                            press_element.get_text(strip=True) if press_element else ""
                        )

                        # 시간 정보 추출
                        time_element = article.select_one("span.date")
                        time_text = (
                            time_element.get_text(strip=True) if time_element else ""
                        )

                        news_item = {
                            "title": title,
                            "summary": summary,
                            "link": link,
                            "press": press,
                            "time": time_text,
                            "source": "naver",
                            "category": "economy",
                        }

                        news_list.append(news_item)

                    except Exception as e:
                        print(f"Error parsing article: {e}")
                        continue

        except Exception as e:
            print(f"Error fetching Naver news: {e}")
            # 스크래핑이 실패하면 데모 데이터 제공
            news_list = [
                {
                    "title": "[데모] 한국은행, 기준금리 동결 - 시장 반응은?",
                    "summary": "한국은금리 동결 결정에 따른 시장의 반응과 주요 증시 영향 분석",
                    "link": "https://example.com",
                    "press": "데모 언론사",
                    "time": "2024-01-27 10:30",
                    "source": "naver",
                    "category": "economy",
                },
                {
                    "title": "[데모] 반도체 업황 회복 조짐, 관련주 강세",
                    "summary": "글로벌 반도체 업황 회복 기대감으로 국내 반도체 주목",
                    "link": "https://example.com",
                    "press": "데모 언론사",
                    "time": "2024-01-27 09:15",
                    "source": "naver",
                    "category": "economy",
                },
            ]

        return news_list

    def get_daum_economy_news(self, limit: int = 20) -> List[Dict[str, Any]]:
        """
        다음 경제 뉴스를 크롤링합니다.
        """
        news_list = []

        try:
            url = "https://news.daum.net/economic"
            response = self.session.get(url, timeout=10)
            response.raise_for_status()

            soup = BeautifulSoup(response.content, "html.parser")

            # 뉴스 기사 목록 찾기
            articles = soup.select("div.item_news")

            for article in articles[:limit]:
                try:
                    # 제목 추출
                    title_element = article.select_one("strong.tit_news a")
                    if not title_element:
                        continue

                    title = title_element.get_text(strip=True)
                    link = title_element.get("href", "")

                    # 요약 내용 추출
                    summary_element = article.select_one("span.desc_news")
                    summary = (
                        summary_element.get_text(strip=True) if summary_element else ""
                    )

                    # 언론사 정보 추출
                    press_element = article.select_one("span.info_news")
                    press = press_element.get_text(strip=True) if press_element else ""

                    news_item = {
                        "title": title,
                        "summary": summary,
                        "link": link,
                        "press": press,
                        "time": datetime.now().strftime("%Y-%m-%d %H:%M"),
                        "source": "daum",
                        "category": "economy",
                    }

                    news_list.append(news_item)

                except Exception as e:
                    print(f"Error parsing article: {e}")
                    continue

        except Exception as e:
            print(f"Error fetching Daum news: {e}")
            # 데모 데이터 제공
            news_list = [
                {
                    "title": "[데모] 다음 경제 뉴스 - 주요 경제 지표 분석",
                    "summary": "최근 발표된 주요 경제 지표와 시장 영향 분석",
                    "link": "https://example.com",
                    "press": "데모 언론사",
                    "time": "2024-01-27 11:20",
                    "source": "daum",
                    "category": "economy",
                }
            ]

        return news_list

    def get_all_economy_news(
        self, limit_per_source: int = 15, focus_us: bool = False
    ) -> List[Dict[str, Any]]:
        """
        모든 경제 뉴스를 가져옵니다.
        """
        # 데모 뉴스 데이터 (실제 크롤링이 실패할 경우를 대비)
        if focus_us:
            demo_news = [
                {
                    "title": "Fed Reserve Signals Potential Rate Cuts in 2024",
                    "summary": "Federal Reserve officials indicated that interest rate cuts may be possible later this year if inflation continues to decline.",
                    "link": "https://example.com/us-news1",
                    "press": "Reuters",
                    "time": "2024-01-27 10:30",
                    "source": "reuters",
                    "category": "economy",
                },
                {
                    "title": "Tech Stocks Rally on AI Optimism, NASDAQ Gains 2%",
                    "summary": "Major technology stocks surged as investors expressed optimism about artificial intelligence growth prospects.",
                    "link": "https://example.com/us-news2",
                    "press": "Bloomberg",
                    "time": "2024-01-27 09:15",
                    "source": "bloomberg",
                    "category": "economy",
                },
                {
                    "title": "Apple Reports Strong Q4 Earnings, Stock Jumps 5%",
                    "summary": "Apple exceeded analyst expectations with strong iPhone sales and services revenue growth.",
                    "link": "https://example.com/us-news3",
                    "press": "CNBC",
                    "time": "2024-01-27 08:45",
                    "source": "cnbc",
                    "category": "economy",
                },
                {
                    "title": "Tesla Announces New Gigafactory, Expands Production Capacity",
                    "summary": "Tesla revealed plans for a new manufacturing facility to meet growing demand for electric vehicles.",
                    "link": "https://example.com/us-news4",
                    "press": "WSJ",
                    "time": "2024-01-27 07:30",
                    "source": "wsj",
                    "category": "economy",
                },
                {
                    "title": "NVIDIA Stock Hits Record High on AI Chip Demand",
                    "summary": "NVIDIA shares reached an all-time high as demand for AI processors continues to surge globally.",
                    "link": "https://example.com/us-news5",
                    "press": "TechCrunch",
                    "time": "2024-01-27 06:15",
                    "source": "techcrunch",
                    "category": "economy",
                },
            ]
        else:
            demo_news = [
                {
                    "title": "한국은행, 기준금리 동결 결정",
                    "summary": "한국은행이 금융통화위원회에서 기준금리를 현행 수준으로 유지하기로 결정했습니다.",
                    "link": "https://example.com/news1",
                    "press": "경제일보",
                    "time": "2024-01-27 10:30",
                    "source": "naver",
                    "category": "economy",
                },
                {
                    "title": "반도체 업황 회복세, 2분기 실적 기대감",
                    "summary": "글로벌 반도체 업황이 회복되면서 국내 반도체 관련주의 실적 개선 기대감이 높아지고 있습니다.",
                    "link": "https://example.com/news2",
                    "press": "테크뉴스",
                    "time": "2024-01-27 09:15",
                    "source": "naver",
                    "category": "economy",
                },
                {
                    "title": "전기차 배터리 3사, 미국에서 생산 늘린다",
                    "summary": "국내 3대 배터리 기업이 미국 내 생산 capacity를 대폭 확충하는 방안을 추진 중입니다.",
                    "link": "https://example.com/news3",
                    "press": "산업일보",
                    "time": "2024-01-27 08:45",
                    "source": "daum",
                    "category": "economy",
                },
                {
                    "title": "코스피 2,500선 회복, 외국인 순매수 전환",
                    "summary": "코스피가 2,500선을 회복하며 외국인 매세력이 순매수로 전환되었습니다.",
                    "link": "https://example.com/news4",
                    "press": "증권일보",
                    "time": "2024-01-27 07:30",
                    "source": "naver",
                    "category": "economy",
                },
                {
                    "title": "AI 반도체 수요 증가, 관련주 주목받아",
                    "summary": "인공지능 반도체 수요가 급증하며 관련 기업들의 주가가 상승하고 있습니다.",
                    "link": "https://example.com/news5",
                    "press": "IT뉴스",
                    "time": "2024-01-27 06:15",
                    "source": "daum",
                    "category": "economy",
                },
            ]

        if focus_us:
            # 미국 뉴스는 향후 실제 크롤링 구현 - 지금은 데모 데이터 사용
            all_news = demo_news[: limit_per_source * 2]
        else:
            naver_news = self.get_naver_economy_news(limit_per_source)
            time.sleep(1)  # 요청 간 간격
            daum_news = self.get_daum_economy_news(limit_per_source)
            all_news = naver_news + daum_news

        # 실제 뉴스가 없을 경우 데모 데이터 사용
        if len(all_news) == 0:
            all_news = demo_news[: limit_per_source * 2]

        # 시간순으로 정렬 (최신 순)
        all_news.sort(key=lambda x: x["time"], reverse=True)

        return all_news[:30]  # 총 30개까지만 반환

    def extract_stock_symbols(self, text: str, market: str = "KOREA") -> List[str]:
        """
        텍스트에서 주식 종목 코드를 추출합니다.
        """
        if market == "US":
            # 미국 주식 심볼 (대문자 1-5자)
            us_symbols = re.findall(r"\b[A-Z]{1,5}\b", text)
            # 일반적인 단어 제외 (THE, AND, FOR 등)
            common_words = {
                "THE",
                "AND",
                "FOR",
                "WITH",
                "FROM",
                "THAT",
                "THIS",
                "HAVE",
                "WILL",
                "YEAR",
                "NEW",
                "SAY",
                "SAYS",
                "SAID",
                "BUT",
                "NOT",
                "ARE",
                "WAS",
                "WERE",
                "BEEN",
                "BEING",
                "HAS",
                "HAD",
                "CAN",
                "COULD",
                "WOULD",
                "SHOULD",
                "MAY",
                "MIGHT",
                "MUST",
            }
            us_symbols = [sym for sym in us_symbols if sym not in common_words]
            return list(set(us_symbols))  # 중복 제거
        else:
            # 6자리 숫자 패턴 (한국 종목 코드)
            stock_codes = re.findall(r"\b\d{6}\b", text)
            return list(set(stock_codes))  # 중복 제거

    def analyze_news_content(
        self, news_item: Dict[str, Any], market: str = "KOREA"
    ) -> Dict[str, Any]:
        """
        뉴스 기사 내용을 분석하여 관련 종목 정보를 추출합니다.
        """
        title = news_item.get("title", "")
        summary = news_item.get("summary", "")
        full_text = f"{title} {summary}"

        # 종목 코드 추출
        stock_codes = self.extract_stock_symbols(full_text, market)

        # 키워드 추출 (간단한 버전)
        keywords = []

        if market == "US":
            economy_keywords = [
                "FED",
                "RATE",
                "RATES",
                "INFLATION",
                "RECESSION",
                "ECONOMY",
                "STOCK",
                "STOCKS",
                "MARKET",
                "NASDAQ",
                "S&P",
                "DOW",
                "INVESTOR",
                "TRADING",
                "SHARES",
                "PRICE",
                "GROWTH",
                "DECLINE",
                "RALLY",
                "SELL",
                "BUY",
                "EARNINGS",
                "REVENUE",
                "PROFIT",
                "TECHNOLOGY",
                "BANK",
                "FINANCIAL",
                "ENERGY",
                "HEALTHCARE",
                "AI",
                "CRYPTO",
            ]
        else:
            economy_keywords = [
                "금리",
                "환율",
                "주가",
                "주식",
                "코스피",
                "코스닥",
                "증시",
                "투자",
                "수익률",
                "상승",
                "하락",
                "반등",
                "반도체",
                "자동차",
                "바이오",
                "IT",
                "금융",
                "유통",
            ]

        for keyword in economy_keywords:
            if keyword.upper() in full_text.upper():
                keywords.append(keyword)

        news_item["extracted_stocks"] = stock_codes
        news_item["keywords"] = keywords

        return news_item
