import pandas as pd
from pathlib import Path
import warnings

warnings.simplefilter(action='ignore', category=FutureWarning)

BASE_DIR = Path(".")
RAW_DIR = BASE_DIR / "raw_files"
OUTPUT_FILE = BASE_DIR / "final_wastage_merged.csv"

def process_wastage():
    if not RAW_DIR.exists():
        print(f"Error: Directory {RAW_DIR} not found.")
        return

    all_files = list(RAW_DIR.glob("*.csv"))
    merged_data = []

    print(f"Found {len(all_files)} files. Processing...")

    for f in all_files:
        try:
            try:
                df = pd.read_csv(f, encoding='utf-8')
            except UnicodeDecodeError:
                try:
                    df = pd.read_csv(f, encoding='gbk')
                except UnicodeDecodeError:
                    df = pd.read_csv(f, encoding='ISO-8859-1')

            df.columns = df.columns.str.strip()

            # Dynamic Column Mapping
            name_col = None
            if 'Product Name' in df.columns:
                name_col = 'Product Name'
            elif 'Item Name' in df.columns:
                name_col = 'Item Name'
            
            # Check strictly required columns
            required_cols = ['Qty Change', 'Transaction Type', 'Audit Time']
            if not name_col or not all(col in df.columns for col in required_cols):
                print(f"Skipping {f.name}: Missing required columns. Found: {list(df.columns)}")
                continue

            # Filter Logic
            mask_type = df['Transaction Type'].astype(str).str.contains("Stocktake", case=False, na=False)
            mask_loss = df['Qty Change'] < 0
            
            subset = df[mask_type & mask_loss].copy()

            if subset.empty:
                continue

            # === MODIFIED HERE: Keep only Date (YYYY-MM-DD) ===
            subset['date'] = pd.to_datetime(subset['Audit Time']).dt.date
            
            subset['dish_name'] = subset[name_col]
            subset['wastage_qty'] = subset['Qty Change'].abs()

            final_subset = subset[['date', 'dish_name', 'wastage_qty']]
            merged_data.append(final_subset)
            
        except Exception as e:
            print(f"Error processing {f.name}: {e}")

    if merged_data:
        final_df = pd.concat(merged_data, ignore_index=True)
        final_df = final_df.sort_values('date')
        
        final_df.to_csv(OUTPUT_FILE, index=False, encoding='utf-8-sig')
        print(f"\nSuccess! Merged {len(final_df)} records.")
        print(f"Saved to: {OUTPUT_FILE}")
        print(final_df.head())
    else:
        print("\nNo valid wastage records found.")

if __name__ == "__main__":
    process_wastage()