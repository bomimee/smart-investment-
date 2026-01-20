import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent  # backend/app
DATA_FILE = BASE_DIR.parent / "data" / "generated" / "stocks.json"

class StockRepo:
    def __init__(self):
        self.records = []
        self.by_code = {}

    def load(self):
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            self.records = json.load(f)
        self.by_code = {r["code"]: r for r in self.records}

repo = StockRepo()
