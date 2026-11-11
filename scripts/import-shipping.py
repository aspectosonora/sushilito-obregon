"""Convert the client's colony price sheets to static menu data.

Usage: python scripts/import-shipping.py <obregon.xlsx> <tabasco.xlsx> <navojoa.xlsx>
"""

import json
import sys
from pathlib import Path

import openpyxl


def read_prices(path: str, colony_column: int, price_column: int):
    sheet = openpyxl.load_workbook(path, read_only=True, data_only=True).worksheets[0]
    rows = []
    for row in sheet.iter_rows(min_row=2, values_only=True):
        name = row[colony_column]
        price = row[price_column]
        if not isinstance(name, str) or not name.strip() or not isinstance(price, (int, float)):
            raise ValueError(f"Invalid colony or price in {path}: {row}")
        rows.append({"name": name.strip(), "price": int(price)})
    return rows


if len(sys.argv) != 4:
    raise SystemExit(__doc__)

data = {
    "obregon": read_prices(sys.argv[1], 0, 3),
    "tabasco": read_prices(sys.argv[2], 0, 3),
    "navojoa": read_prices(sys.argv[3], 1, 4),
}
target = Path(__file__).resolve().parents[1] / "src" / "data" / "shipping-prices.json"
target.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print({key: len(value) for key, value in data.items()})
