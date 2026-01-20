import json
import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]  # backend/
DATA_DIR = BASE_DIR / "data"
SRC_DIR = DATA_DIR / "source"
OUT_DIR = DATA_DIR / "generated"
OUT_DIR.mkdir(parents=True, exist_ok=True)

kospi_file = SRC_DIR / "kospi_code.xlsx"
kosdaq_file = SRC_DIR / "kosdaq_code.xlsx"
out_file = OUT_DIR / "stocks.json"
def normalize_columns(df):
    df.columns = (
        df.columns
        .astype(str)
        .str.strip()
        .str.replace("\u00a0", "", regex=False)  # 특수 공백 제거
    )
    return df

def to_code(x) -> str:
    # 엑셀에서 숫자로 읽히는 경우(5930.0 등) 방어 + 6자리로 맞추기
    if pd.isna(x):
        return ""
    s = str(x).strip()
    if s.endswith(".0"):
        s = s[:-2]
    return s.zfill(6)


def load_kospi(path: Path):
    df = pd.read_excel(path)
    df = normalize_columns(df)

    col_map = {
        "단축코드": "code",
        "종목코드": "code",
        "한글명": "name",
        "한글종목명": "name",
    }

    df = df.rename(columns=col_map)

    if "code" not in df.columns or "name" not in df.columns:
        raise RuntimeError(f"KOSPI 컬럼 인식 실패: {df.columns.tolist()}")

    df["code"] = df["code"].apply(to_code)
    df["name"] = df["name"].astype(str).str.strip()
    df["type"] = "KOSPI"

    return df[["code", "name", "type"]].to_dict(orient="records")


def load_kosdaq(path: Path):
    df = pd.read_excel(path)
    df = normalize_columns(df)

    col_map = {
        "단축코드": "code",
        "한글명": "name",
        "한글종목명": "name",
    }

    df = df.rename(columns=col_map)

    if "code" not in df.columns or "name" not in df.columns:
        raise RuntimeError(f"KOSDAQ 컬럼 인식 실패: {df.columns.tolist()}")

    df["code"] = df["code"].apply(to_code)
    df["name"] = df["name"].astype(str).str.strip()
    df["type"] = "KOSDAQ"
    print("KOSDAQ columns:", df.columns.tolist())
    return df[["code", "name", "type"]].to_dict(orient="records")


kospi = load_kospi(kospi_file)
kosdaq = load_kosdaq(kosdaq_file)

all_records = kospi + kosdaq

# 빈 값 제거(선택)
all_records = [r for r in all_records if r["code"] and r["name"]]

with open(out_file, "w", encoding="utf-8") as f:
    json.dump(all_records, f, ensure_ascii=False, indent=2)

print(f"✅ wrote {len(all_records)} records to {out_file}")
