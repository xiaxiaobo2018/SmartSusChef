from pathlib import Path

import pandas as pd

INPUT_FILE = "3kaggle_data.csv"
OUTPUT_FILE = "3final_kaggle.csv"

def convert_data():
    input_path = Path(INPUT_FILE)
    if not input_path.exists():
        print(f"Error: Input file {input_path} not found.")
        return

    print(f"Reading {INPUT_FILE}...")
    try:
        try:
            df = pd.read_csv(input_path, encoding='utf-8')
        except UnicodeDecodeError:
            df = pd.read_csv(input_path, encoding='ISO-8859-1')
    except Exception as e:
        print(f"Error reading file: {e}")
        return

    df.columns = df.columns.str.strip()
    cols = df.columns.tolist()

    rename_map = {}

    if "menu_item_name" in cols and "quantity_sold" in cols:
        print("Detected Format: Sales Data (using menu_item_name)")
        rename_map = {
            "date": "date",
            "menu_item_name": "dish_name",
            "quantity_sold": "quantity"
        }

    elif "Item_Name" in cols and "Daily_Usage" in cols:
        print("Detected Format: Inventory Usage")
        rename_map = {
            "Date": "date",
            "Item_Name": "dish_name",
            "Daily_Usage": "quantity"
        }

    elif "transaction_datetime" in cols and "menu_item" in cols:
        print("Detected Format: Transaction Logs")
        rename_map = {
            "transaction_datetime": "date",
            "menu_item": "dish_name",
            "quantity": "quantity"
        }

    else:
        print("Error: Unknown file format.")
        print(f"Columns found: {cols}")
        return

    df_ready = df.rename(columns=rename_map)

    required = ["date", "dish_name", "quantity"]
    if not all(col in df_ready.columns for col in required):
        print(f"Error: Missing columns after mapping. Need {required}")
        return

    df_ready = df_ready[required].copy()

    try:
        df_ready["date"] = pd.to_datetime(df_ready["date"]).dt.date
    except Exception as e:
        print(f"Date conversion error: {e}")

    df_final = df_ready.groupby(["date", "dish_name"], as_index=False)["quantity"].sum()
    df_final = df_final.sort_values("date")

    df_final.to_csv(OUTPUT_FILE, index=False, encoding="utf-8-sig")
    print(f"Success! Saved to: {OUTPUT_FILE}")
    print(df_final.head())

if __name__ == "__main__":
    convert_data()
