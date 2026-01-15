from config import APP_KEY, APP_SECRET
from auth import get_access_token, get_approval_key
from kis_rest import KISRestClient
from analyzer import analyze_from_chart
# from kis_ws import run_ws
# from models import WsSubscribeInput

def main():
    is_mock = False

    # 1) REST access_token (차트/현재가/잔고 등)
    access_token = get_access_token(APP_KEY, APP_SECRET, is_mock=is_mock)
    rest = KISRestClient(access_token, APP_KEY, APP_SECRET, is_mock=is_mock)

    # 2) 관심 차트 데이터
    code = "068270"
    chart_rows = rest.get_daily_chart(code, start="20250101", end="20251231", period="D")
    print("chart rows:", len(chart_rows))

    # 3) 분석(일단 규칙 기반 MVP)
    result = analyze_from_chart(code, chart_rows)
    print(chart_rows[0].keys())
    print(result)

    # (선택) 실시간이 필요하면 웹소켓 approval_key도 발급해서 구독
    # approval_key = get_approval_key(APP_KEY, APP_SECRET, is_mock=is_mock)
    # subs = [WsSubscribeInput(tr_id="H0STCNT0", tr_key=code)]
    # run_ws(approval_key, subs, is_mock=is_mock)

if __name__ == "__main__":
    main()
