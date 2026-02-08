import pandas as pd
from pathlib import Path

INPUT_FILE = "2datasetkaggle_data.csv"
OUTPUT_FILE = "2food_sales_kaggle.csv"

RENAME_MAP = {
    "日期": "Date",
    "菜品": "Item_Name",
    "销量": "Daily_Usage"
}

def convert_data():
    input_path = Path(INPUT_FILE)
    if not input_path.exists():
        print(f"Error: Input file not found at {input_path}")
        return

    print(f"Reading data from {INPUT_FILE}...")
    df = pd.read_csv(input_path)

    # Check if required columns exist in source
    missing_cols = [col for col in RENAME_MAP.values() if col not in df.columns]
    if missing_cols:
        print(f"Error: The following columns were not found in the source file: {missing_cols}")
        print(f"Available columns: {list(df.columns)}")
        return

    # Rename columns to match the training script requirements
    df_ready = df.rename(columns={v: k for k, v in RENAME_MAP.items()})
    
    # Filter only necessary columns
    df_ready = df_ready[["日期", "菜品", "销量"]]
    
    # Standardize date format if necessary (optional)
    try:
        df_ready["日期"] = pd.to_datetime(df_ready["日期"])
    except Exception as e:
        print(f"Warning: Date parsing failed. Please check date format. {e}")

    # Save to CSV
    df_ready.to_csv(OUTPUT_FILE, index=False, encoding="utf-8-sig")
    print(f"Success! Converted data saved to: {OUTPUT_FILE}")
    print("You can now set DATA_FOOD = Path('food_sales_kaggle.csv') in the main script.")

if __name__ == "__main__":
    convert_data()