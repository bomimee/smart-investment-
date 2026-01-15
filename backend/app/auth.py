import requests
from config import (
    DOMAIN_REAL, DOMAIN_VTS,
    PATH_APPROVAL, PATH_TOKEN,
    DEFAULT_CONTENT_TYPE,
)
from models import ApprovalRequestBody, TokenRequestBody

def _base(is_mock: bool) -> str:
    return DOMAIN_VTS if is_mock else DOMAIN_REAL

def get_approval_key(appkey: str, secretkey: str, is_mock: bool = False) -> str:
    url = f"{_base(is_mock)}{PATH_APPROVAL}"
    headers = {"Content-Type": DEFAULT_CONTENT_TYPE}
    payload = ApprovalRequestBody(appkey=appkey, secretkey=secretkey).to_dict()

    resp = requests.post(url, headers=headers, json=payload, timeout=15)
    resp.raise_for_status()
    data = resp.json()

    approval_key = data.get("approval_key")
    if not approval_key:
        raise RuntimeError(f"approval_key가 응답에 없음. 응답: {data}")
    return approval_key

def get_access_token(appkey: str, appsecret: str, is_mock: bool = False) -> str:
    url = f"{_base(is_mock)}{PATH_TOKEN}"
    headers = {"Content-Type": DEFAULT_CONTENT_TYPE}
    payload = TokenRequestBody(appkey=appkey, appsecret=appsecret).to_dict()
    resp = requests.post(url, headers=headers, json=payload, timeout=15)
    resp.raise_for_status()
    data = resp.json()
    token = data.get("access_token")
    if not token:
        raise RuntimeError(f"access_token이 응답에 없음. 응답: {data}")
    return token

