import pandas as pd
from pathlib import Path

# Paths
BASE_DIR = Path(".")
RAW_DIR = BASE_DIR / "raw_files"  # Put your 30+ csv files here
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
            # Handle encoding
            try:
                df = pd.read_csv(f, encoding='utf-8')
            except UnicodeDecodeError:
                df = pd.read_csv(f, encoding='ISO-8859-1')

            # Normalize headers
            df.columns = df.columns.str.strip()

            # Check required columns
            required_cols = ['Product Name', 'Qty Change', 'Transaction Type', 'Audit Time']
            if not all(col in df.columns for col in required_cols):
                print(f"Skipping {f.name}: Missing required columns.")
                continue

            # Filter Logic: Transaction contains 'Stocktake' AND Quantity is negative (Loss)
            mask_type = df['Transaction Type'].astype(str).str.contains("Stocktake", case=False, na=False)
            mask_loss = df['Qty Change'] < 0
            
            subset = df[mask_type & mask_loss].copy()

            if subset.empty:
                continue

            # Transform to standard format
            subset['date'] = pd.to_datetime(subset['Audit Time'])
            subset['dish_name'] = subset['Product Name']
            subset['wastage_qty'] = subset['Qty Change'].abs() # Store as positive value
            subset['source_file'] = f.name
            
            # Placeholders for cost (Calculated later in DB or Frontend)
            subset['unit_cost'] = 0.0
            subset['total_loss_money'] = 0.0

            # Select final columns
            final_cols = ['date', 'dish_name', 'wastage_qty', 'unit_cost', 'total_loss_money', 'source_file']
            merged_data.append(subset[final_cols])
            
        except Exception as e:
            print(f"Error processing {f.name}: {e}")

    # Merge and Save
    if merged_data:
        final_df = pd.concat(merged_data, ignore_index=True)
        final_df = final_df.sort_values('date')
        
        final_df.to_csv(OUTPUT_FILE, index=False, encoding='utf-8-sig')
        print(f"\nSuccess! Merged {len(final_df)} wastage records to: {OUTPUT_FILE}")
    else:
        print("\nNo valid Stocktake Loss records found.")

if __name__ == "__main__":
    process_wastage()