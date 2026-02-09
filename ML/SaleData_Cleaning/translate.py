#!/usr/bin/env python3
import csv
import sys

COL_MAP = {
    "日期": "date",
    "菜品": "dish",
    "销量": "sales",
}

DISH_MAP = {
    "掌中宝": "Chicken knee cartilage",
    "烤羊肉串": "Grilled lamb skewers",
    "老坛酸菜味江团": "Old-jar pickled mustard greens flavor - Jiangtuan",
    "老坛酸菜味海鲈鱼": "Old-jar pickled mustard greens flavor - Sea bass",
    "老坛酸菜味黔鱼": "Old-jar pickled mustard greens flavor - Qian fish",
    "蒜香味江团": "Garlic flavor - Jiangtuan",
    "蒜香味海鲈鱼": "Garlic flavor - Sea bass",
    "蒜香味黔鱼": "Garlic flavor - Qian fish",
    "酸菜味江团": "Pickled mustard greens flavor - Jiangtuan",
    "酸菜味海鲈鱼": "Pickled mustard greens flavor - Sea bass",
    "酸菜味黔鱼": "Pickled mustard greens flavor - Qian fish",
    "青椒味江团": "Green pepper flavor - Jiangtuan",
    "青椒味海鲈鱼": "Green pepper flavor - Sea bass",
    "青椒味黔鱼": "Green pepper flavor - Qian fish",
    "麻辣味江团": "Mala flavor - Jiangtuan",
    "麻辣味海鲈鱼": "Mala flavor - Sea bass",
    "麻辣味黔鱼": "Mala flavor - Qian fish",
}

def replace_row(row, dish_col_idx):
    if dish_col_idx is not None and 0 <= dish_col_idx < len(row):
        v = row[dish_col_idx]
        if v in DISH_MAP:
            row[dish_col_idx] = DISH_MAP[v]
    return row

def main():
    if len(sys.argv) != 3:
        print("Usage: python3 translate.py input.csv output.csv", file=sys.stderr)
        sys.exit(2)

    in_path, out_path = sys.argv[1], sys.argv[2]

    # utf-8-sig: handle BOM in the first header (e.g., "﻿date")
    with open(in_path, "r", encoding="utf-8-sig", newline="") as f_in, \
         open(out_path, "w", encoding="utf-8", newline="") as f_out:
        reader = csv.reader(f_in)
        writer = csv.writer(f_out)

        header = next(reader)
        header = [COL_MAP.get(h, h) for h in header]
        writer.writerow(header)

        dish_col_idx = None
        for i, h in enumerate(header):
            if h == "dish":
                dish_col_idx = i
                break

        missing = set()
        for row in reader:
            if dish_col_idx is not None and dish_col_idx < len(row):
                v = row[dish_col_idx]
                if v and v not in DISH_MAP:
                    missing.add(v)
            writer.writerow(replace_row(row, dish_col_idx))

    if missing:
        print("Unmapped dish values (kept as-is):")
        for v in sorted(missing):
            print(" -", v)

if __name__ == "__main__":
    main()
